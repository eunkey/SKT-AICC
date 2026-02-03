import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `당신은 SK텔레콤 고객센터의 에스컬레이션 메시지를 작성하는 AI입니다.
상담사가 고객 응대 중 해결이 어려운 건을 담당 부서에 이관할 때, 대화 내용을 기반으로 이관 메시지를 작성합니다.

작성 형식:
■ 고객 상황 요약
- 고객이 겪고 있는 문제를 2~3문장으로 요약

■ 확인된 증상
- 대화에서 파악된 구체적 증상을 bullet point로

■ 1차 조치 내역
- 상담사가 안내/시도한 조치 내용 (대화에 없으면 "확인 불가"로 기재)

■ 이관 사유
- 이관이 필요한 이유를 간결하게

■ 요청 사항
- 이관받는 부서에 요청하는 구체적 조치

작성 지침:
1. 대화 내용에서 파악된 사실만 기재 (추측 금지)
2. 대화 내용이 없거나 부족하면 장애 유형 정보를 기반으로 기본 이관 메시지 작성
3. 간결하고 업무적인 톤 유지
4. 고객 개인정보는 마스킹`;

export async function POST(request: NextRequest) {
  try {
    const { transcript, guideTitle, guideCategory, symptoms, escalationDept } = await request.json();

    const userPrompt = `다음 정보를 기반으로 "${escalationDept}"에 보낼 에스컬레이션 메시지를 작성해주세요.

[장애 유형]
카테고리: ${guideCategory}
제목: ${guideTitle}
관련 증상: ${symptoms.join(', ')}
이관 부서: ${escalationDept}

[상담 대화 내용]
${transcript || '(대화 내용 없음 - 장애 유형 정보를 기반으로 작성해주세요)'}

위 내용을 바탕으로 이관 메시지를 작성해주세요.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const message = completion.choices[0]?.message?.content || '이관 메시지를 생성할 수 없습니다.';

    return NextResponse.json({
      message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Escalation summary error:', error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API Error: ${error.message}` },
        { status: error.status || 500 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate escalation summary' },
      { status: 500 },
    );
  }
}
