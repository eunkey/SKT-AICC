import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `당신은 SK텔레콤 고객센터의 전문 상담사입니다. 다음 지침을 따라주세요:

1. 친절하고 공손한 말투를 사용하세요 (존댓말 필수)
2. 고객의 문의에 정확하고 도움이 되는 답변을 제공하세요
3. 답변은 간결하게 2-3문장으로 제한하세요
4. 필요한 경우 추가 정보를 요청하세요
5. 본인 확인이 필요한 경우 생년월일이나 등록된 전화번호를 확인하세요

SK텔레콤 상담 분야:
- 요금제 변경 및 상담 (5G, LTE, 데이터 무제한 등)
- T멤버십 혜택 및 포인트
- 로밍 서비스 (baro 로밍, 데이터 로밍)
- 휴대폰 분실/정지/해제
- 청구서 및 요금 문의
- 기기 변경 및 번호이동
- 부가서비스 (T전화, 콜러링, 스팸차단 등)
- 인터넷/TV 결합상품 (SK브로드밴드)
- 통화품질 및 네트워크 문의

현재 상담 맥락:
- SK텔레콤 고객이 통신 관련 문의를 하고 있습니다
- 친절하고 전문적인 상담을 제공하세요
- "고객님"이라는 호칭을 사용하세요`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // 대화 히스토리 구성
    const messages: Message[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10), // 최근 10개 메시지만 유지
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 200,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || '죄송합니다, 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';

    return NextResponse.json({
      text: responseText,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat completion error:', error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API Error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
