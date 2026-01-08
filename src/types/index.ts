export interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: number;
  subscriberCount: number;
  viralRatio: number;
  duration: string;
  isShorts: boolean;
}

export interface Comment {
  id: string;
  text: string;
  authorName: string;
  likeCount: number;
  publishedAt: string;
}

export interface AnalysisResult {
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    summary: string;
  };
  keywords: {
    keyword: string;
    count: number;
    importance: number;
  }[];
  interests: string[];
  totalComments: number;
}

export interface RecommendedKeyword {
  keyword: string;
  reason: string;
  potentialScore: number;
}

export interface ScriptOutline {
  title: string;
  hook: string;
  sections: {
    title: string;
    description: string;
    duration: string;
  }[];
  conclusion: string;
  callToAction: string;
}

export type ContentType = 'all' | 'shorts' | 'long';

export interface SearchFilters {
  contentType: ContentType;
  minViralRatio: number;
  maxViralRatio: number;
}
