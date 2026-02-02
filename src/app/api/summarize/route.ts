import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `당신은 SK텔레콤 고객센터의 상담 내용을 요약하는 AI입니다.
주어진 대화 내용을 분석하여 다음 형식으로 요약해주세요:

## 상담 요약

**고객명**: [고객명]
**상담 시간**: [시간]

### 문의 내용
- [고객이 문의한 주요 내용을 bullet point로]

### 처리 내용
1. [처리한 내용을 순서대로]

### 추가 안내
- [고객에게 안내한 추가 사항]

중요 지침:
1. 실제 대화 내용에서 파악된 정보만 포함하세요
2. 대화에 없는 내용은 추측하지 마세요
3. 고객의 실제 문의 유형을 정확히 파악하세요 (요금제, 로밍, 분실, 청구서 등)
4. 간결하고 명확하게 작성하세요
5. 민감한 개인정보(주민번호, 카드번호 등)는 마스킹 처리하세요`;

export async function POST(request: NextRequest) {
  try {
    const { transcript, customerName, callDuration } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    const durationText = callDuration
      ? `${Math.floor(callDuration / 60)}분 ${callDuration % 60}초`
      : '알 수 없음';

    const userPrompt = `다음은 SK텔레콤 고객센터 상담 대화 내용입니다. 이 내용을 요약해주세요.

고객명: ${customerName || '고객'}
상담 시간: ${durationText}

=== 대화 내용 ===
${transcript}
=== 대화 끝 ===

위 대화 내용을 기반으로 상담 요약을 작성해주세요.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const summary = completion.choices[0]?.message?.content || '요약을 생성할 수 없습니다.';

    // SMS 내용도 생성
    const smsCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 SK텔레콤 고객센터의 SMS 메시지를 작성하는 AI입니다.
상담 내용을 바탕으로 고객에게 발송할 짧은 SMS 메시지를 작성하세요.
- [SK텔레콤]으로 시작
- 100자 이내로 간결하게
- 처리 결과와 문의 연락처(114) 포함
- 대화 내용에 맞는 실제 처리 결과만 포함`
        },
        {
          role: 'user',
          content: `다음 상담 요약을 바탕으로 고객에게 발송할 SMS 메시지를 작성해주세요:\n\n${summary}`
        },
      ],
      max_tokens: 100,
      temperature: 0.3,
    });

    const smsContent = smsCompletion.choices[0]?.message?.content || '';

    return NextResponse.json({
      summary,
      smsContent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Summary generation error:', error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API Error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
