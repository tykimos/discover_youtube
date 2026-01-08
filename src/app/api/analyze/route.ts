import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AnalysisResult, Comment } from '@/types';

// OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { comments, videoTitle } = await request.json() as {
      comments: Comment[];
      videoTitle: string;
    };

    if (!comments || comments.length === 0) {
      return NextResponse.json({ error: '분석할 댓글이 없습니다.' }, { status: 400 });
    }

    // 댓글 텍스트 준비 (최대 100개)
    const commentTexts = comments
      .slice(0, 100)
      .map((c: Comment) => c.text)
      .join('\n---\n');

    const prompt = `당신은 유튜브 댓글 분석 전문가입니다. 다음 영상의 댓글들을 분석해주세요.

영상 제목: ${videoTitle}

댓글 목록:
${commentTexts}

다음 JSON 형식으로 분석 결과를 반환해주세요:
{
  "sentiment": {
    "positive": <긍정 댓글 비율 (0-100)>,
    "neutral": <중립 댓글 비율 (0-100)>,
    "negative": <부정 댓글 비율 (0-100)>,
    "summary": "<시청자 반응을 2-3문장으로 요약>"
  },
  "keywords": [
    {"keyword": "<자주 언급된 키워드>", "count": <언급 횟수>, "importance": <중요도 0-100>},
    ... (최대 15개)
  ],
  "interests": [
    "<시청자들이 관심 있어하는 주제 1>",
    "<시청자들이 관심 있어하는 주제 2>",
    ... (최대 5개)
  ]
}

중요:
- 키워드는 실제 댓글에서 자주 등장하거나 중요한 의미를 가진 단어/구문을 추출하세요.
- 관심사는 댓글에서 시청자들이 더 알고 싶어하거나 관심을 보이는 주제를 파악해주세요.
- 감정 비율의 합은 100이어야 합니다.
- 한국어로 응답해주세요.
- 반드시 유효한 JSON 형식으로만 응답하세요.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: '당신은 유튜브 댓글 분석 전문가입니다. 반드시 JSON 형식으로만 응답해주세요. 다른 텍스트 없이 오직 JSON만 출력하세요.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
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

    const analysis = JSON.parse(jsonContent) as AnalysisResult;
    analysis.totalComments = comments.length;

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: '댓글 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
