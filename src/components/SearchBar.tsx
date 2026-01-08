'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchFilters } from '@/types';
import { Search, SlidersHorizontal, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    contentType: 'all',
    minViralRatio: 0,
    maxViralRatio: 100,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), filters);
    }
  };

  const contentTypeOptions = [
    { value: 'all' as const, label: '전체', icon: '📺' },
    { value: 'shorts' as const, label: '숏폼', icon: '📱' },
    { value: 'long' as const, label: '롱폼', icon: '🎬' },
  ];

  const presets = [
    { label: '일반', min: 0, max: 10 },
    { label: '인기', min: 10, max: 50 },
    { label: '바이럴', min: 50, max: 100 },
    { label: '대박', min: 100, max: 1000 },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="어떤 콘텐츠 소재를 찾고 계신가요?"
              className="pl-10 pr-4 h-14 text-lg"
              disabled={isLoading}
            />
          </div>
          
          <Button
            type="button"
            variant={showFilters ? "default" : "outline"}
            size="icon"
            className="h-14 w-14"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Button>

          <Button 
            type="submit" 
            size="lg"
            disabled={isLoading || !query.trim()}
            className="h-14 px-8"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                검색 중
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                검색
              </>
            )}
          </Button>
        </div>
      </form>

      {/* 필터 패널 */}
      {showFilters && (
        <Card className="animate-in slide-in-from-top-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">검색 필터</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* 콘텐츠 유형 */}
            <div className="space-y-3 mb-6">
              <label className="text-sm font-medium">콘텐츠 유형</label>
              <div className="grid grid-cols-3 gap-3">
                {contentTypeOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={filters.contentType === option.value ? "default" : "outline"}
                    onClick={() => setFilters({ ...filters, contentType: option.value })}
                    className="h-12"
                  >
                    <span className="mr-2">{option.icon}</span>
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 바이럴 비율 */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                바이럴 비율 범위 (조회수 / 구독자수 × 100)
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    max={filters.maxViralRatio}
                    value={filters.minViralRatio}
                    onChange={(e) => setFilters({ ...filters, minViralRatio: Number(e.target.value) })}
                    className="text-center"
                    placeholder="최소"
                  />
                  <span className="block text-center text-xs text-muted-foreground mt-1">최소</span>
                </div>
                <span className="text-muted-foreground">~</span>
                <div className="flex-1">
                  <Input
                    type="number"
                    min={filters.minViralRatio}
                    max="1000"
                    value={filters.maxViralRatio}
                    onChange={(e) => setFilters({ ...filters, maxViralRatio: Number(e.target.value) })}
                    className="text-center"
                    placeholder="최대"
                  />
                  <span className="block text-center text-xs text-muted-foreground mt-1">최대</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {presets.map((preset) => (
                  <Badge
                    key={preset.label}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => setFilters({ 
                      ...filters, 
                      minViralRatio: preset.min, 
                      maxViralRatio: preset.max 
                    })}
                  >
                    {preset.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 필터 초기화 */}
            <Button
              variant="secondary"
              className="w-full mt-6"
              onClick={() => {
                setFilters({
                  contentType: 'all',
                  minViralRatio: 0,
                  maxViralRatio: 100,
                });
              }}
            >
              필터 초기화
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 적용된 필터 표시 */}
      {(filters.contentType !== 'all' || filters.minViralRatio > 0 || filters.maxViralRatio < 100) && (
        <div className="flex flex-wrap gap-2">
          {filters.contentType !== 'all' && (
            <Badge variant="secondary">
              {contentTypeOptions.find(o => o.value === filters.contentType)?.icon} {' '}
              {contentTypeOptions.find(o => o.value === filters.contentType)?.label}
            </Badge>
          )}
          {(filters.minViralRatio > 0 || filters.maxViralRatio < 100) && (
            <Badge variant="secondary">
              바이럴 {filters.minViralRatio}-{filters.maxViralRatio}%
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}