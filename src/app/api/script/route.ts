import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ScriptOutline, RecommendedKeyword } from '@/types';

// OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { keyword, originalVideoTitle } = await request.json() as {
      keyword: RecommendedKeyword;
      originalVideoTitle: string;
    };

    if (!keyword) {
      return NextResponse.json({ error: '키워드가 필요합니다.' }, { status: 400 });
    }

    const prompt = `당신은 유튜브 대본 작가입니다. 다음 주제로 유튜브 영상 대본 목차를 작성해주세요.

주제: ${keyword.keyword}
추천 이유: ${keyword.reason}
참고 원본 영상: ${originalVideoTitle}

다음 JSON 형식으로 대본 목차를 작성해주세요:
{
  "title": "<영상 제목 (클릭을 유도하는 매력적인 제목)>",
  "hook": "<첫 3초 후킹 멘트 (시청자의 관심을 사로잡는 문장)>",
  "sections": [
    {
      "title": "<섹션 제목>",
      "description": "<이 섹션에서 다룰 내용 설명>",
      "duration": "<예상 소요 시간 (예: 1분 30초)>"
    },
    ... (3-5개 섹션)
  ],
  "conclusion": "<마무리 멘트 (핵심 내용 요약 및 시청자에게 전달할 메시지)>",
  "callToAction": "<시청자 액션 유도 멘트 (구독, 좋아요, 댓글 등)>"
}

중요:
- 한국어로 작성하세요.
- 유튜브 시청자가 끝까지 시청하고 싶어하는 구조로 만드세요.
- 각 섹션은 명확한 목적을 가지고 있어야 합니다.
- 후킹 멘트는 호기심을 자극하는 질문이나 충격적인 사실로 시작하세요.
- 반드시 유효한 JSON 형식으로만 응답하세요.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: '당신은 인기 유튜브 영상의 대본을 작성하는 전문 작가입니다. 반드시 JSON 형식으로만 응답해주세요. 다른 텍스트 없이 오직 JSON만 출력하세요.' },
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

    const outline = JSON.parse(jsonContent) as ScriptOutline;

    return NextResponse.json({ outline });
  } catch (error) {
    console.error('Script error:', error);
    return NextResponse.json(
      { error: '대본 목차 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
