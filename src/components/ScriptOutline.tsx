'use client';

import { ScriptOutline, RecommendedKeyword } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText,
  Clock,
  Copy,
  Download,
  Check,
  Zap,
  ListOrdered,
  MessageSquare
} from 'lucide-react';
import { useState } from 'react';

interface ScriptOutlineProps {
  keyword: RecommendedKeyword;
  outline: ScriptOutline | null;
  isLoading: boolean;
  isCompact?: boolean;
}

export default function ScriptOutlineComponent({ 
  keyword, 
  outline, 
  isLoading,
  isCompact = false
}: ScriptOutlineProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!outline) return;

    const text = `
# ${outline.title}

## 🎣 후킹
${outline.hook}

## 📝 본문
${outline.sections.map((s, i) => `
### ${i + 1}. ${s.title} (${s.duration})
${s.description}
`).join('')}

## 🎬 마무리
${outline.conclusion}

## 📣 CTA
${outline.callToAction}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!outline) return;

    const text = `
# ${outline.title}

## 🎣 후킹
${outline.hook}

## 📝 본문
${outline.sections.map((s, i) => `
### ${i + 1}. ${s.title} (${s.duration})
${s.description}
`).join('')}

## 🎬 마무리
${outline.conclusion}

## 📣 CTA
${outline.callToAction}
    `.trim();

    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${keyword.keyword}_대본목차.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
            <CardTitle className="mb-2">대본 목차 생성 중</CardTitle>
            <CardDescription>
              AI가 "{keyword.keyword}" 주제로 대본을 구상하고 있습니다...
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!outline) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 mb-2">
              <FileText size={24} className="text-primary" />
              대본 목차
            </CardTitle>
            <CardDescription>
              키워드: <span className="font-medium text-foreground">{keyword.keyword}</span>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
            >
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              <span>{copied ? '복사됨!' : '복사'}</span>
            </Button>
            <Button
              variant="outline" 
              size="sm"
              onClick={handleDownload}
            >
              <Download size={18} />
              <span>다운로드</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>

        {/* 제목 */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{outline.title}</h3>
        </div>

        {/* 후킹 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={20} className="text-accent" />
            <h4 className="font-bold text-lg">🎣 후킹 (첫 3초)</h4>
          </div>
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-muted-foreground leading-relaxed italic">
              "{outline.hook}"
            </p>
          </div>
        </div>

        {/* 본문 섹션 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ListOrdered size={20} className="text-secondary" />
            <h4 className="font-bold text-lg">📝 본문</h4>
          </div>
          <div className="space-y-3">
            {outline.sections.map((section, index) => (
              <div 
                key={index}
                className="bg-muted/50 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Badge className="w-8 h-8 rounded-full p-0 flex items-center justify-center font-bold">
                      {index + 1}
                    </Badge>
                    <h5 className="font-semibold">{section.title}</h5>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock size={14} />
                    <span>{section.duration}</span>
                  </div>
                </div>
                <p className="text-muted-foreground ml-11">
                  {section.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 마무리 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🎬</span>
            <h4 className="font-bold text-lg">마무리</h4>
          </div>
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-muted-foreground leading-relaxed">
              {outline.conclusion}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={20} className="text-primary" />
            <h4 className="font-bold text-lg">📣 Call to Action</h4>
          </div>
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 border border-primary/30">
            <p className="font-medium">
              {outline.callToAction}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
