import { NextRequest, NextResponse } from 'next/server';
import { VideoItem, SearchFilters } from '@/types';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      high: { url: string };
    };
  };
}

interface YouTubeVideoDetails {
  id: string;
  contentDetails: {
    duration: string;
  };
  statistics: {
    viewCount: string;
  };
}

interface YouTubeChannelDetails {
  id: string;
  statistics: {
    subscriberCount: string;
  };
}

// ISO 8601 duration을 읽기 쉬운 형식으로 변환
function parseDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// 숏폼 여부 확인 (60초 이하)
function isShorts(duration: string): boolean {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return false;

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return totalSeconds <= 60;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const contentType = searchParams.get('contentType') || 'all';
  const minViralRatio = parseFloat(searchParams.get('minViralRatio') || '0');
  const maxViralRatio = parseFloat(searchParams.get('maxViralRatio') || '100');

  if (!query) {
    return NextResponse.json({ error: '검색어가 필요합니다.' }, { status: 400 });
  }

  if (!YOUTUBE_API_KEY) {
    return NextResponse.json({ error: 'YouTube API 키가 설정되지 않았습니다.' }, { status: 500 });
  }

  try {
    // 1. 영상 검색
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=25&` +
      `regionCode=KR&relevanceLanguage=ko&key=${YOUTUBE_API_KEY}`
    );

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      console.error('YouTube API Error:', errorData);
      
      // Check for common API errors
      if (errorData.error?.code === 403) {
        if (errorData.error.message.includes('YouTube Data API v3 has not been used')) {
          const projectId = errorData.error.message.match(/project (\d+)/)?.[1];
          return NextResponse.json({ 
            error: 'YouTube Data API v3가 활성화되지 않았습니다.',
            details: `Google Cloud Console에서 YouTube Data API v3를 활성화해주세요:\nhttps://console.developers.google.com/apis/api/youtube.googleapis.com/overview?project=${projectId || 'YOUR_PROJECT_ID'}`
          }, { status: 403 });
        } else if (errorData.error.message.includes('API key not valid')) {
          return NextResponse.json({ 
            error: 'YouTube API 키가 유효하지 않습니다.',
            details: '.env.local 파일의 YOUTUBE_API_KEY를 확인해주세요.'
          }, { status: 403 });
        }
      }
      
      throw new Error(`YouTube 검색 API 오류: ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    const searchData = await searchResponse.json();
    const videoIds = searchData.items.map((item: YouTubeSearchItem) => item.id.videoId).join(',');

    if (!videoIds) {
      return NextResponse.json({ videos: [] });
    }

    // 2. 영상 상세 정보 (조회수, 재생시간)
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      `part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );

    if (!videosResponse.ok) {
      throw new Error('YouTube 영상 API 오류');
    }

    const videosData = await videosResponse.json();
    const videoDetailsMap = new Map<string, YouTubeVideoDetails>();
    videosData.items.forEach((item: YouTubeVideoDetails) => {
      videoDetailsMap.set(item.id, item);
    });

    // 3. 채널 정보 (구독자 수)
    const channelIds = [...new Set(searchData.items.map((item: YouTubeSearchItem) => item.snippet.channelId))].join(',');
    
    const channelsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?` +
      `part=statistics&id=${channelIds}&key=${YOUTUBE_API_KEY}`
    );

    if (!channelsResponse.ok) {
      throw new Error('YouTube 채널 API 오류');
    }

    const channelsData = await channelsResponse.json();
    const channelDetailsMap = new Map<string, YouTubeChannelDetails>();
    channelsData.items.forEach((item: YouTubeChannelDetails) => {
      channelDetailsMap.set(item.id, item);
    });

    // 4. 데이터 조합
    const videos: VideoItem[] = searchData.items
      .map((item: YouTubeSearchItem) => {
        const videoDetails = videoDetailsMap.get(item.id.videoId);
        const channelDetails = channelDetailsMap.get(item.snippet.channelId);

        if (!videoDetails || !channelDetails) return null;

        const viewCount = parseInt(videoDetails.statistics.viewCount) || 0;
        const subscriberCount = parseInt(channelDetails.statistics.subscriberCount) || 1;
        const viralRatio = (viewCount / subscriberCount) * 100;
        const videoIsShorts = isShorts(videoDetails.contentDetails.duration);

        return {
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnailUrl: item.snippet.thumbnails.high.url,
          channelId: item.snippet.channelId,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          viewCount,
          subscriberCount,
          viralRatio,
          duration: parseDuration(videoDetails.contentDetails.duration),
          isShorts: videoIsShorts,
        };
      })
      .filter((video: VideoItem | null): video is VideoItem => {
        if (!video) return false;

        // 콘텐츠 유형 필터
        if (contentType === 'shorts' && !video.isShorts) return false;
        if (contentType === 'long' && video.isShorts) return false;

        // 바이럴 비율 필터
        if (video.viralRatio < minViralRatio || video.viralRatio > maxViralRatio) return false;

        return true;
      })
      // 바이럴 비율 순으로 정렬
      .sort((a: VideoItem, b: VideoItem) => b.viralRatio - a.viralRatio);

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
