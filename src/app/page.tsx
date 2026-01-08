'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import SearchBar from '@/components/SearchBar';
import VideoCard from '@/components/VideoCard';
import AnalysisResultComponent from '@/components/AnalysisResult';
import ScriptOutlineComponent from '@/components/ScriptOutline';
import { 
  VideoItem, 
  SearchFilters, 
  AnalysisResult, 
  RecommendedKeyword,
  ScriptOutline,
  Comment
} from '@/types';
import { 
  Youtube, 
  TrendingUp, 
  MessageSquare, 
  Sparkles,
  FileText,
  ArrowLeft,
  RefreshCw,
  Search,
  BarChart3,
  Brain,
  Zap,
  ChevronRight,
  X,
  Loader2,
  Filter,
  Grid,
  LayoutGrid,
  Globe,
  MapPin,
  Hash as HashIcon,
  RefreshCcw
} from 'lucide-react';

interface TrendingData {
  trends: {
    korea: Array<{ keyword: string; count: number; category: string }>;
    usa: Array<{ keyword: string; count: number; category: string }>;
    categories: Record<string, Array<{ keyword: string; count: number }>>;
  };
  timestamp: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedKeyword[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<RecommendedKeyword | null>(null);
  const [scriptOutline, setScriptOutline] = useState<ScriptOutline | null>(null);
  const [trendingData, setTrendingData] = useState<TrendingData | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<'korea' | 'usa'>('korea');
  
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    contentType: 'all',
    minViralRatio: 0,
    maxViralRatio: 100,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreVideos, setHasMoreVideos] = useState(true);
  const [gridCols, setGridCols] = useState('4');

  // 검색
  const handleSearch = async (query: string, filters: SearchFilters, isNewSearch = true) => {
    if (isNewSearch) {
      setIsLoading(true);
      setVideos([]);
      setCurrentPage(1);
      setHasMoreVideos(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);
    setSearchQuery(query);
    setSearchFilters(filters);

    try {
      const params = new URLSearchParams({
        q: query,
        contentType: filters.contentType,
        minViralRatio: filters.minViralRatio.toString(),
        maxViralRatio: filters.maxViralRatio.toString(),
        page: isNewSearch ? '1' : currentPage.toString(),
      });

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.details ? `${data.error}\n\n${data.details}` : (data.error || '검색 중 오류가 발생했습니다.');
        throw new Error(errorMessage);
      }

      if (isNewSearch) {
        setVideos(data.videos);
      } else {
        setVideos(prev => [...prev, ...data.videos]);
      }
      
      if (data.videos.length < 12) {
        setHasMoreVideos(false);
      }
      
      if (!isNewSearch) {
        setCurrentPage(prev => prev + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // 영상 분석
  const handleAnalyze = async (video: VideoItem) => {
    setSelectedVideo(video);
    setIsAnalyzing(true);
    setError(null);
    setSheetOpen(true); // 사이드 패널 열기

    try {
      // 1. 댓글 수집
      const commentsResponse = await fetch(`/api/comments?videoId=${video.id}&maxResults=100`);
      const commentsData = await commentsResponse.json();

      if (!commentsResponse.ok) {
        throw new Error(commentsData.error || '댓글 수집 중 오류가 발생했습니다.');
      }

      const comments: Comment[] = commentsData.comments;

      if (comments.length === 0) {
        throw new Error('분석할 댓글이 없습니다.');
      }

      // 2. AI 댓글 분석
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments, videoTitle: video.title }),
      });

      const analysisData = await analysisResponse.json();

      if (!analysisResponse.ok) {
        throw new Error(analysisData.error || '분석 중 오류가 발생했습니다.');
      }

      setAnalysis(analysisData.analysis);
      setIsAnalyzing(false);

      // 3. 키워드 추천 (분석 완료 후 자동으로)
      setIsLoadingRecommendations(true);

      const recommendResponse = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          analysis: analysisData.analysis, 
          videoTitle: video.title 
        }),
      });

      const recommendData = await recommendResponse.json();

      if (!recommendResponse.ok) {
        throw new Error(recommendData.error || '추천 생성 중 오류가 발생했습니다.');
      }

      setRecommendations(recommendData.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.');
      setIsAnalyzing(false);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // 키워드 선택 및 대본 생성
  const handleSelectKeyword = async (keyword: RecommendedKeyword) => {
    setSelectedKeyword(keyword);
    setIsLoadingScript(true);

    try {
      const response = await fetch('/api/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          keyword, 
          originalVideoTitle: selectedVideo?.title 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '대본 생성 중 오류가 발생했습니다.');
      }

      setScriptOutline(data.outline);
    } catch (err) {
      setError(err instanceof Error ? err.message : '대본 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingScript(false);
    }
  };

  // 처음으로 돌아가기
  const handleReset = () => {
    setVideos([]);
    setSelectedVideo(null);
    setAnalysis(null);
    setRecommendations([]);
    setSelectedKeyword(null);
    setScriptOutline(null);
    setError(null);
    setSheetOpen(false);
    setCurrentPage(1);
    setHasMoreVideos(true);
  };

  // 사이드 패널 닫기
  const handleCloseSheet = () => {
    setSheetOpen(false);
    setSelectedVideo(null);
    setAnalysis(null);
    setRecommendations([]);
    setSelectedKeyword(null);
    setScriptOutline(null);
  };

  // 더보기 로드
  const loadMoreVideos = () => {
    if (searchQuery && !isLoadingMore && hasMoreVideos) {
      handleSearch(searchQuery, searchFilters, false);
    }
  };

  // 인라인 비디오 재생
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  
  const handlePlayVideo = (videoId: string) => {
    setPlayingVideoId(videoId === playingVideoId ? null : videoId);
  };

  // 트렌드 데이터 가져오기
  const fetchTrends = async () => {
    setIsLoadingTrends(true);
    try {
      const response = await fetch('/api/trends');
      const data = await response.json();
      
      if (response.ok) {
        setTrendingData(data);
      }
    } catch (error) {
      console.error('Failed to fetch trends:', error);
    } finally {
      setIsLoadingTrends(false);
    }
  };

  // 컴포넌트 마운트 시 트렌드 로드
  useEffect(() => {
    fetchTrends();
    
    // 5분마다 트렌드 업데이트
    const interval = setInterval(fetchTrends, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-900/95 backdrop-blur">
        <div className="container flex h-16 items-center px-4">
          <button 
            onClick={handleReset}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Youtube className="h-6 w-6 text-zinc-400" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-zinc-100">
                유튜브 소재 발굴기
              </h1>
              <p className="text-xs text-muted-foreground">AI 기반 콘텐츠 분석</p>
            </div>
          </button>

          {/* 그리드 선택 버튼 */}
          {videos.length > 0 && (
            <div className="ml-auto mr-4 flex items-center gap-1">
              <Button
                variant={gridCols === '3' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setGridCols('3')}
                className="p-2"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={gridCols === '4' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setGridCols('4')}
                className="p-2"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="ml-auto flex items-center gap-2">
            {videos.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">새 검색</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-6">

        {/* 검색 화면 */}
        {videos.length === 0 && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* 히어로 섹션 */}
            <div className="text-center py-16 space-y-6">
              <Badge variant="secondary" className="gap-2">
                <Sparkles className="h-3 w-3" />
                AI 기반 유튜브 분석
              </Badge>
              
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-100">
                  바이럴 영상을 발굴하세요
                </h2>
                
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  키워드를 입력하면 바이럴 가능성이 높은 영상을 찾고,
                  댓글 분석을 통해 새로운 콘텐츠 아이디어를 얻을 수 있습니다.
                </p>
              </div>

              <SearchBar onSearch={handleSearch} isLoading={isLoading} />

              {/* 에러 메시지 표시 */}
              {error && (
                <div className="mx-auto max-w-2xl">
                  <Card className="border-red-900/20 bg-red-950/20">
                    <CardContent className="pt-6">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-red-900/20 flex items-center justify-center">
                            <span className="text-red-500">⚠</span>
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-sm font-medium text-red-400">오류가 발생했습니다</p>
                          <p className="text-sm text-zinc-400 whitespace-pre-line">{error}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* 트렌드 키워드 섹션 */}
              <div className="space-y-6">
                {/* 트렌드 헤더 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">실시간 트렌드</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchTrends}
                      disabled={isLoadingTrends}
                      className="h-8 px-2"
                    >
                      {isLoadingTrends ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCcw className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant={selectedRegion === 'korea' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedRegion('korea')}
                      className="h-8"
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      한국
                    </Button>
                    <Button
                      variant={selectedRegion === 'usa' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedRegion('usa')}
                      className="h-8"
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      미국
                    </Button>
                  </div>
                </div>

                {/* 트렌드 키워드 리스트 */}
                <div className="flex flex-wrap justify-center gap-2">
                  {isLoadingTrends ? (
                    <>
                      {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-24" />
                      ))}
                    </>
                  ) : trendingData ? (
                    <>
                      {trendingData.trends[selectedRegion].slice(0, 10).map((trend, index) => (
                        <Button
                          key={trend.keyword}
                          variant={index < 3 ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSearch(trend.keyword, { contentType: 'all', minViralRatio: 0, maxViralRatio: 100 })}
                          className="gap-1"
                        >
                          {index < 3 && <TrendingUp className="h-3 w-3" />}
                          {trend.keyword}
                          <Badge variant="secondary" className="ml-1 text-xs px-1">
                            {trend.count}
                          </Badge>
                        </Button>
                      ))}
                    </>
                  ) : (
                    // 기본 키워드 (트렌드 로드 실패 시)
                    ['AI 기술', '먹방', '여행 브이로그', '게임 리뷰', '자기계발'].map((keyword) => (
                      <Button
                        key={keyword}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSearch(keyword, { contentType: 'all', minViralRatio: 0, maxViralRatio: 100 })}
                      >
                        {keyword}
                      </Button>
                    ))
                  )}
                </div>

                {/* 카테고리별 트렌드 */}
                {trendingData && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      마지막 업데이트: {new Date(trendingData.timestamp).toLocaleTimeString('ko-KR')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 기능 소개 */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: TrendingUp,
                  title: '바이럴 영상 발굴',
                  description: '조회수 대비 구독자 수 비율을 분석하여 잘 터진 영상을 자동으로 찾아냅니다.',
                  gradient: 'from-zinc-700 to-zinc-800',
                },
                {
                  icon: Brain,
                  title: 'AI 댓글 분석',
                  description: '댓글을 AI로 분석하여 시청자 반응과 관심사를 파악합니다.',
                  gradient: 'from-zinc-700 to-zinc-800',
                },
                {
                  icon: Zap,
                  title: '대본 목차 생성',
                  description: '분석 결과를 바탕으로 새로운 콘텐츠의 대본 목차를 자동 생성합니다.',
                  gradient: 'from-zinc-700 to-zinc-800',
                },
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5`} />
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* 검색 결과 화면 */}
        {videos.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">검색 결과</h2>
                <p className="text-muted-foreground">
                  {videos.length}개의 영상을 찾았습니다
                </p>
              </div>
            </div>

            <div className={`grid gap-4 ${
              gridCols === '3' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' 
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
            }`}>
              {videos.map((video) => (
                <VideoCard 
                  key={video.id}
                  video={video} 
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing && selectedVideo?.id === video.id}
                  isPlaying={playingVideoId === video.id}
                  onPlayToggle={() => handlePlayVideo(video.id)}
                />
              ))}
            </div>

            {/* 더보기 버튼 */}
            {hasMoreVideos && (
              <div className="flex justify-center pt-8">
                <Button
                  onClick={loadMoreVideos}
                  disabled={isLoadingMore}
                  size="lg"
                  variant="outline"
                  className="gap-2"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      로드 중...
                    </>
                  ) : (
                    <>
                      더보기
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* 분석 결과 사이드 패널 */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {selectedVideo ? selectedVideo.title : '영상 분석'}
            </SheetTitle>
            <SheetDescription>
              AI 기반 댓글 분석 및 콘텐츠 추천
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            {/* 에러 메시지 */}
            {error && (
              <Card className="mb-6 border-destructive/50 bg-destructive/10">
                <CardContent className="pt-6">
                  <p className="text-sm text-destructive">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* 분석 중 로딩 */}
            {isAnalyzing && (
              <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            )}

            {/* 분석 결과 */}
            {!isAnalyzing && selectedVideo && analysis && (
              <Tabs defaultValue="analysis" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="analysis">분석</TabsTrigger>
                  <TabsTrigger value="recommendations">추천</TabsTrigger>
                  <TabsTrigger value="script">대본</TabsTrigger>
                </TabsList>

                <TabsContent value="analysis" className="space-y-6">
                  <AnalysisResultComponent
                    video={selectedVideo}
                    analysis={analysis}
                    recommendations={recommendations}
                    onSelectKeyword={handleSelectKeyword}
                    selectedKeyword={selectedKeyword}
                    isLoadingRecommendations={isLoadingRecommendations}
                    isCompact={true}
                  />
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-6">
                  {isLoadingRecommendations ? (
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recommendations.map((keyword) => (
                        <Card 
                          key={keyword.keyword}
                          className="cursor-pointer hover:shadow-lg transition-all"
                          onClick={() => handleSelectKeyword(keyword)}
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{keyword.keyword}</CardTitle>
                              <Badge variant="outline">
                                잠재력 {keyword.potentialScore}/10
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{keyword.reason}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="script" className="space-y-6">
                  {selectedKeyword ? (
                    <ScriptOutlineComponent
                      keyword={selectedKeyword}
                      outline={scriptOutline}
                      isLoading={isLoadingScript}
                      isCompact={true}
                    />
                  ) : (
                    <Card className="py-8">
                      <CardContent className="text-center">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">키워드를 선택하세요</h3>
                        <p className="text-sm text-muted-foreground">
                          추천 탭에서 키워드를 선택하면 대본 목차가 생성됩니다.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* 푸터 */}
      <footer className="border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 유튜브 소재 발굴기. AI 기반 콘텐츠 분석 도구.</p>
        </div>
      </footer>
    </div>
  );
}