import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AnalysisResult, RecommendedKeyword } from '@/types';

// OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { analysis, videoTitle } = await request.json() as {
      analysis: AnalysisResult;
      videoTitle: string;
    };

    if (!analysis) {
      return NextResponse.json({ error: '분석 결과가 필요합니다.' }, { status: 400 });
    }

    const prompt = `당신은 유튜브 콘텐츠 전략가입니다. 다음 영상의 댓글 분석 결과를 바탕으로 새로운 콘텐츠 소재를 추천해주세요.

원본 영상 제목: ${videoTitle}

댓글 분석 결과:
- 시청자 반응: ${analysis.sentiment.summary}
- 주요 키워드: ${analysis.keywords.slice(0, 10).map(k => k.keyword).join(', ')}
- 시청자 관심사: ${analysis.interests.join(', ')}

다음 JSON 형식으로 5개의 추천 콘텐츠 키워드를 제안해주세요:
{
  "recommendations": [
    {
      "keyword": "<추천 콘텐츠 주제/키워드>",
      "reason": "<이 주제를 추천하는 이유 (댓글 분석 기반)>",
      "potentialScore": <바이럴 가능성 점수 0-100>
    },
    ... (정확히 5개)
  ]
}

중요:
- 댓글에서 시청자들이 궁금해하거나 더 알고 싶어하는 내용을 기반으로 추천하세요.
- 원본 영상과 연관성이 있으면서도 새로운 각도의 콘텐츠를 제안하세요.
- 한국어로 응답해주세요.
- 잠재력 점수는 현실적으로 평가해주세요.
- 반드시 유효한 JSON 형식으로만 응답하세요.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: '당신은 유튜브 콘텐츠 전략가입니다. 반드시 JSON 형식으로만 응답해주세요. 다른 텍스트 없이 오직 JSON만 출력하세요.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('AI 응답이 비어있습니다.');
    }

    // JSON 파싱 (마크다운 코드블록 제거)
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.slice(7);
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.slice(3);
    }
    if (jsonContent.endsWith('```')) {
      jsonContent = jsonContent.slice(0, -3);
    }
    jsonContent = jsonContent.trim();

    const result = JSON.parse(jsonContent) as { recommendations: RecommendedKeyword[] };

    return NextResponse.json({ recommendations: result.recommendations });
  } catch (error) {
    console.error('Recommend error:', error);
    return NextResponse.json(
      { error: '키워드 추천 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
