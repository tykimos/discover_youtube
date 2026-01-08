import { NextRequest, NextResponse } from 'next/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

interface TrendingKeyword {
  keyword: string;
  category: string;
  region: 'KR' | 'US';
  count: number;
}

export async function GET(request: NextRequest) {
  try {
    if (!YOUTUBE_API_KEY) {
      return NextResponse.json(
        { error: 'YouTube API key is not configured' },
        { status: 500 }
      );
    }

    // 한국과 미국의 인기 동영상 가져오기
    const regions = ['KR', 'US'];
    const allKeywords: TrendingKeyword[] = [];

    for (const regionCode of regions) {
      const url = new URL('https://www.googleapis.com/youtube/v3/videos');
      url.searchParams.append('part', 'snippet');
      url.searchParams.append('chart', 'mostPopular');
      url.searchParams.append('regionCode', regionCode);
      url.searchParams.append('maxResults', '50');
      url.searchParams.append('key', YOUTUBE_API_KEY);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (!response.ok) {
        console.error(`Failed to fetch trends for ${regionCode}:`, data);
        continue;
      }

      // 제목과 태그에서 키워드 추출
      const keywordMap = new Map<string, number>();
      
      for (const video of data.items) {
        // 제목에서 키워드 추출
        const title = video.snippet.title;
        const titleWords = extractKeywords(title);
        titleWords.forEach(word => {
          keywordMap.set(word, (keywordMap.get(word) || 0) + 2); // 제목은 가중치 2
        });

        // 태그에서 키워드 추출
        const tags = video.snippet.tags || [];
        tags.forEach((tag: string) => {
          const cleanTag = tag.toLowerCase().trim();
          if (cleanTag.length > 2) {
            keywordMap.set(cleanTag, (keywordMap.get(cleanTag) || 0) + 1);
          }
        });

        // 카테고리 추가
        const categoryId = video.snippet.categoryId;
        const categoryName = getCategoryName(categoryId);
        if (categoryName) {
          keywordMap.set(categoryName, (keywordMap.get(categoryName) || 0) + 1);
        }
      }

      // 상위 10개 키워드 선택
      const sortedKeywords = Array.from(keywordMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      sortedKeywords.forEach(([keyword, count]) => {
        allKeywords.push({
          keyword,
          category: determineCategory(keyword),
          region: regionCode as 'KR' | 'US',
          count
        });
      });
    }

    // 카테고리별로 그룹화
    const categorizedTrends = {
      korea: allKeywords.filter(k => k.region === 'KR'),
      usa: allKeywords.filter(k => k.region === 'US'),
      categories: {
        gaming: allKeywords.filter(k => k.category === 'Gaming').slice(0, 5),
        music: allKeywords.filter(k => k.category === 'Music').slice(0, 5),
        entertainment: allKeywords.filter(k => k.category === 'Entertainment').slice(0, 5),
        education: allKeywords.filter(k => k.category === 'Education').slice(0, 5),
        tech: allKeywords.filter(k => k.category === 'Tech').slice(0, 5),
        lifestyle: allKeywords.filter(k => k.category === 'Lifestyle').slice(0, 5),
      }
    };

    return NextResponse.json({
      trends: categorizedTrends,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Trends API error:', error);
    return NextResponse.json(
      { error: '트렌드 데이터를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 키워드 추출 함수
function extractKeywords(text: string): string[] {
  // 불필요한 문자 제거
  const cleaned = text
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 단어 분리
  const words = cleaned.split(' ').filter(word => {
    return word.length > 2 && // 2자 이상
           !isStopWord(word) && // 불용어 제외
           !/^\d+$/.test(word); // 숫자만으로 된 단어 제외
  });

  return words;
}

// 불용어 리스트
function isStopWord(word: string): boolean {
  const stopWords = [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have',
    'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you',
    'do', 'at', 'this', 'but', 'his', 'by', 'from', 'is', 'was',
    '은', '는', '이', '가', '을', '를', '의', '에', '에서', '으로',
    '와', '과', '도', '만', '하고', '하는', '하다', '있다', '되다'
  ];
  return stopWords.includes(word.toLowerCase());
}

// 카테고리 ID를 이름으로 변환
function getCategoryName(categoryId: string): string | null {
  const categories: Record<string, string> = {
    '1': 'Film & Animation',
    '2': 'Autos & Vehicles',
    '10': 'Music',
    '15': 'Pets & Animals',
    '17': 'Sports',
    '19': 'Travel & Events',
    '20': 'Gaming',
    '22': 'People & Blogs',
    '23': 'Comedy',
    '24': 'Entertainment',
    '25': 'News & Politics',
    '26': 'Howto & Style',
    '27': 'Education',
    '28': 'Science & Technology',
  };
  return categories[categoryId] || null;
}

// 키워드를 카테고리로 분류
function determineCategory(keyword: string): string {
  const lowerKeyword = keyword.toLowerCase();
  
  if (/game|gaming|게임|플레이|play/i.test(lowerKeyword)) return 'Gaming';
  if (/music|음악|song|노래|뮤직|mv/i.test(lowerKeyword)) return 'Music';
  if (/tech|기술|ai|코딩|개발|프로그래/i.test(lowerKeyword)) return 'Tech';
  if (/study|공부|교육|학습|강의/i.test(lowerKeyword)) return 'Education';
  if (/뷰티|beauty|패션|fashion|먹방|요리|cook/i.test(lowerKeyword)) return 'Lifestyle';
  if (/news|뉴스|정치|경제/i.test(lowerKeyword)) return 'News';
  if (/sports|스포츠|축구|야구|농구/i.test(lowerKeyword)) return 'Sports';
  
  return 'Entertainment';
}