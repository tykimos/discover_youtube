'use client';

import { AnalysisResult, RecommendedKeyword, VideoItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Minus,
  MessageSquare,
  Hash,
  Sparkles,
  ArrowRight,
  Lightbulb
} from 'lucide-react';

interface AnalysisResultProps {
  video: VideoItem;
  analysis: AnalysisResult;
  recommendations: RecommendedKeyword[];
  onSelectKeyword: (keyword: RecommendedKeyword) => void;
  selectedKeyword: RecommendedKeyword | null;
  isLoadingRecommendations: boolean;
  isCompact?: boolean;
}

export default function AnalysisResultComponent({
  video,
  analysis,
  recommendations,
  onSelectKeyword,
  selectedKeyword,
  isLoadingRecommendations,
  isCompact = false,
}: AnalysisResultProps) {
  const getKeywordVariant = (index: number): "default" | "secondary" | "destructive" | "outline" => {
    const variants = ['default', 'secondary', 'outline'] as const;
    return variants[index % variants.length];
  };

  const getKeywordSize = (importance: number) => {
    if (importance >= 80) return 'text-lg px-4 py-2';
    if (importance >= 60) return 'text-base px-3 py-2';
    if (importance >= 40) return 'text-sm px-3 py-1.5';
    return 'text-xs px-2 py-1';
  };

  return (
    <div className="space-y-6">
      {/* 분석 대상 영상 정보 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-40 h-auto rounded-xl shadow-md"
            />
            <div className="flex-1">
              <CardTitle className="mb-2">{video.title}</CardTitle>
              <CardDescription className="mb-2">{video.channelTitle}</CardDescription>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare size={16} />
                <span>{analysis.totalComments}개의 댓글 분석 완료</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 감정 분석 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                💬
              </div>
              시청자 반응 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* 감정 바 */}
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-green-500">
                    <ThumbsUp size={16} />
                    긍정
                  </span>
                  <span>{analysis.sentiment.positive}%</span>
                </div>
                <Progress value={analysis.sentiment.positive} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Minus size={16} />
                    중립
                  </span>
                  <span>{analysis.sentiment.neutral}%</span>
                </div>
                <Progress value={analysis.sentiment.neutral} className="h-2 [&>div]:bg-gray-400" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-red-500">
                    <ThumbsDown size={16} />
                    부정
                  </span>
                  <span>{analysis.sentiment.negative}%</span>
                </div>
                <Progress value={analysis.sentiment.negative} className="h-2 [&>div]:bg-red-400" />
              </div>
            </div>

            <CardDescription className="leading-relaxed">
              {analysis.sentiment.summary}
            </CardDescription>
          </CardContent>
        </Card>

        {/* 관심사 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                🎯
              </div>
              시청자 관심사
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.interests.map((interest, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center text-sm">
                    {index + 1}
                  </Badge>
                  <span>{interest}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 키워드 분석 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <Hash size={18} className="text-accent" />
            </div>
            주요 키워드
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.keywords.map((keyword, index) => (
              <Badge
                key={keyword.keyword}
                variant={getKeywordVariant(index)}
                className={`${getKeywordSize(keyword.importance)} whitespace-nowrap`}
              >
                {keyword.keyword}
                <span className="ml-1.5 opacity-70">({keyword.count})</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 추천 키워드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            추천 콘텐츠 키워드
          </CardTitle>
          <CardDescription>
            키워드를 선택하면 대본 목차가 생성됩니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRecommendations ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <span className="ml-3 text-muted-foreground">AI가 추천 키워드를 생성 중...</span>
            </div>
          ) : (
            <div className="grid gap-4">
              {recommendations.map((rec, index) => (
                <Button
                  key={rec.keyword}
                  variant={selectedKeyword?.keyword === rec.keyword ? "default" : "outline"}
                  onClick={() => onSelectKeyword(rec)}
                  className="w-full h-auto p-5 justify-start"
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '💡'}
                        </span>
                        <h4 className="text-lg font-bold">{rec.keyword}</h4>
                        <Badge variant="secondary" className="text-xs">
                          잠재력 {rec.potentialScore}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-start gap-2">
                        <Lightbulb size={16} className="flex-shrink-0 mt-0.5" />
                        {rec.reason}
                      </p>
                    </div>
                    <ArrowRight size={24} className="flex-shrink-0 ml-4" />
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
