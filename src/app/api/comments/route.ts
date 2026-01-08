import { NextRequest, NextResponse } from 'next/server';
import { Comment } from '@/types';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

interface YouTubeCommentItem {
  id: string;
  snippet: {
    topLevelComment: {
      snippet: {
        textDisplay: string;
        authorDisplayName: string;
        likeCount: number;
        publishedAt: string;
      };
    };
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get('videoId');
  const maxResults = parseInt(searchParams.get('maxResults') || '100');

  if (!videoId) {
    return NextResponse.json({ error: '영상 ID가 필요합니다.' }, { status: 400 });
  }

  if (!YOUTUBE_API_KEY) {
    return NextResponse.json({ error: 'YouTube API 키가 설정되지 않았습니다.' }, { status: 500 });
  }

  try {
    const allComments: Comment[] = [];
    let pageToken: string | null = null;

    // 페이지네이션으로 댓글 수집
    while (allComments.length < maxResults) {
      const url = new URL('https://www.googleapis.com/youtube/v3/commentThreads');
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('videoId', videoId);
      url.searchParams.set('maxResults', Math.min(100, maxResults - allComments.length).toString());
      url.searchParams.set('order', 'relevance');
      url.searchParams.set('key', YOUTUBE_API_KEY);
      
      if (pageToken) {
        url.searchParams.set('pageToken', pageToken);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json();
        
        // 댓글이 비활성화된 경우
        if (errorData.error?.errors?.[0]?.reason === 'commentsDisabled') {
          return NextResponse.json({ 
            comments: [],
            error: '이 영상은 댓글이 비활성화되어 있습니다.'
          });
        }
        
        throw new Error('댓글 수집 중 오류 발생');
      }

      const data = await response.json();

      const comments: Comment[] = data.items.map((item: YouTubeCommentItem) => ({
        id: item.id,
        text: item.snippet.topLevelComment.snippet.textDisplay
          .replace(/<[^>]*>/g, '') // HTML 태그 제거
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'"),
        authorName: item.snippet.topLevelComment.snippet.authorDisplayName,
        likeCount: item.snippet.topLevelComment.snippet.likeCount,
        publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
      }));

      allComments.push(...comments);

      pageToken = data.nextPageToken || null;
      if (!pageToken) break;
    }

    return NextResponse.json({ comments: allComments });
  } catch (error) {
    console.error('Comments error:', error);
    return NextResponse.json(
      { error: '댓글 수집 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
