import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `당신은 SK텔레콤 상담사를 보조하는 AI입니다. 고객과 상담사 간의 대화 내용을 분석하여 다음 정보를 JSON 형식으로 추출해주세요:

1. **query**: 대화에서 추출한 핵심 검색 쿼리 (문서 검색에 사용될 2-4단어)
2. **summary**: 대화 요약 (마크다운 형식, 상담사가 빠르게 파악할 수 있도록 구조화)
   - 고객의 주요 문의 사항
   - 현재 상담 상태
   - 주의해야 할 점
3. **keywords**: 추출된 키워드 배열 (요금제, 로밍, 분실, 인터넷, T멤버십 등 SK텔레콤 관련 키워드)
4. **recommendedScript**: 상담사가 바로 사용할 수 있는 추천 응대 스크립트 (친절하고 전문적인 톤)

SK텔레콤 주요 상담 분야:
- 요금제: 5G/LTE 요금제, 데이터 무제한, 요금제 변경
- 로밍: baro로밍, 로밍패스, 해외 데이터 사용
- 분실: 휴대폰 분실 신고, 회선 정지, 보험
- 인터넷: SK브로드밴드, 인터넷/TV 결합
- T멤버십: 포인트, 등급 혜택, 제휴사 할인
- 부가서비스: T전화, 콜러링, 스팸차단

응답은 반드시 아래 JSON 형식을 따라주세요:
{
  "query": "검색 쿼리",
  "summary": "## 고객 문의 요약\\n\\n내용...",
  "keywords": ["키워드1", "키워드2"],
  "recommendedScript": "추천 응대 스크립트"
}`;

interface AnalyzeResponse {
  query: string;
  summary: string;
  keywords: string[];
  recommendedScript: string;
}

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: '대화 내용이 필요합니다.' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `다음 상담 대화를 분석해주세요:\n\n${transcript}` },
      ],
      max_tokens: 1000,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('AI 응답이 비어있습니다.');
    }

    const parsed: AnalyzeResponse = JSON.parse(responseText);

    // 응답 검증
    if (!parsed.query || !parsed.summary || !parsed.keywords || !parsed.recommendedScript) {
      throw new Error('AI 응답 형식이 올바르지 않습니다.');
    }

    return NextResponse.json({
      query: parsed.query,
      summary: parsed.summary,
      keywords: parsed.keywords,
      recommendedScript: parsed.recommendedScript,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analyze API error:', error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API Error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'AI 응답 파싱 실패' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: '분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
