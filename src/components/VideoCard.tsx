'use client';

import { useState } from 'react';
import { VideoItem } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Users, 
  TrendingUp, 
  Clock, 
  MessageCircle,
  Play,
  Pause,
  Loader2,
  ExternalLink,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoCardProps {
  video: VideoItem;
  onAnalyze: (video: VideoItem) => void;
  isAnalyzing: boolean;
  isPlaying?: boolean;
  onPlayToggle?: () => void;
}

export default function VideoCard({ 
  video, 
  onAnalyze, 
  isAnalyzing,
  isPlaying = false,
  onPlayToggle
}: VideoCardProps) {
  const [showPlayer, setShowPlayer] = useState(false);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getViralBadgeVariant = (ratio: number): "default" | "secondary" | "outline" => {
    if (ratio >= 50) return 'outline';
    if (ratio >= 10) return 'secondary';
    return 'secondary';
  };

  const getViralLabel = (ratio: number): string => {
    if (ratio >= 100) return '🔥';
    if (ratio >= 50) return '⚡';
    if (ratio >= 10) return '📈';
    return '📊';
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
      {/* 썸네일 또는 플레이어 */}
      <div className="relative aspect-video overflow-hidden bg-secondary">
        {showPlayer ? (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <>
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* 숏폼 배지 */}
            {video.isShorts && (
              <Badge className="absolute top-2 left-2 text-xs" variant="destructive">
                Shorts
              </Badge>
            )}
            
            {/* 재생 시간 */}
            <div className="absolute bottom-2 right-2 bg-black/80 text-white px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {video.duration}
            </div>

            {/* 재생 버튼 오버레이 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPlayer(true);
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100">
                <Play className="h-5 w-5 text-white fill-white ml-0.5" />
              </div>
            </button>
          </>
        )}
      </div>

      <CardHeader className="p-3 pb-2 flex-1">
        {/* 바이럴 비율 배지 */}
        <div className="flex items-center justify-between mb-2">
          <Badge 
            variant={getViralBadgeVariant(video.viralRatio)}
            className="text-xs gap-1"
          >
            {getViralLabel(video.viralRatio)} {video.viralRatio.toFixed(1)}%
          </Badge>
          {showPlayer && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setShowPlayer(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* 제목 */}
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>

        {/* 채널 정보 */}
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
          {video.channelTitle}
        </p>
      </CardHeader>

      <CardContent className="p-3 pt-0">
        {/* 통계 */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{formatNumber(video.viewCount)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{formatNumber(video.subscriberCount)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0 flex gap-2">
        {/* 분석 버튼 */}
        <Button
          onClick={() => onAnalyze(video)}
          disabled={isAnalyzing}
          className="flex-1 text-xs h-8"
          variant="default"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              분석 중
            </>
          ) : (
            <>
              <MessageCircle className="mr-1 h-3 w-3" />
              분석
            </>
          )}
        </Button>
        
        {/* 유튜브에서 보기 버튼 */}
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
        >
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}