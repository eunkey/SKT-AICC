import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getPromptDictionary } from '@/lib/skt-dictionary';
import { ExtractedTopic, TopicType } from '@/types/sms';

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
5. 민감한 개인정보(주민번호, 카드번호 등)는 마스킹 처리하세요
6. 고객이 줄임말/구어체를 사용한 경우 요약에는 정식 상품명을 사용하세요

${getPromptDictionary()}`;

const TOPIC_EXTRACTION_PROMPT = `당신은 SK텔레콤 고객센터 상담 내용에서 토픽을 추출하는 AI입니다.
대화 내용을 분석하여 상담된 각 주제(토픽)별로 정보를 추출하세요.

토픽 타입:
- plan_change: 요금제 변경 (변경 전/후 요금제, 적용일, 요금 변화)
- plan_inquiry: 요금제 문의/추천 (추천 요금제, 요금, 혜택)
- roaming: 로밍 안내 (여행 국가, 추천 상품, 요금, 기간)
- addon_service: 부가서비스 (가입/해지 서비스, 월 요금)
- billing: 청구/요금 (청구 내역, 요금 문의, 납부)
- membership: 멤버십/혜택 (T멤버십, 혜택 안내)
- device: 단말기 (단말기 정보, 할부, 보험)
- general: 일반 안내 (기타 문의)

반드시 아래 JSON 형식으로만 응답하세요:
{
  "topics": [
    {
      "id": "topic_1",
      "type": "plan_change",
      "title": "요금제 변경 안내",
      "summary": "5G 프라임에서 0 청년 59로 변경, 3/1 적용",
      "keyInfo": {
        "현재요금제": "5G 프라임",
        "변경요금제": "0 청년 59",
        "현재금액": "89,000원",
        "변경금액": "59,000원",
        "적용일": "3월 1일",
        "월절감": "약 30,000원"
      },
      "smsContent": "[SK텔레콤] 요금제 변경 안내\\n\\n{고객명}님, 요금제 변경이 접수되었습니다.\\n\\n▶ 변경 내용\\n• 현재: 5G 프라임 (89,000원)\\n• 변경: 0 청년 59 (59,000원)\\n• 적용일: 3월 1일\\n• 월 절감: 약 30,000원\\n\\n※ T월드 앱에서 확인 가능\\n문의: 114"
    }
  ]
}

지침:
1. 대화에서 실제로 다뤄진 주제만 추출하세요
2. 각 토픽의 keyInfo는 해당 토픽에 필요한 핵심 정보만 포함하세요
3. smsContent는 고객에게 실용적인 정보를 제공하는 형식으로 작성하세요
4. {고객명}은 그대로 유지하세요 (나중에 치환됩니다)
5. 금액은 "원" 단위로, 날짜는 이해하기 쉽게 표기하세요
6. SMS는 간결하면서도 필요한 정보가 모두 포함되도록 작성하세요

${getPromptDictionary()}`;

interface TopicExtractionResponse {
  topics: Array<{
    id: string;
    type: TopicType;
    title: string;
    summary: string;
    keyInfo: Record<string, string>;
    smsContent: string;
  }>;
}

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

    // 요약 생성과 토픽 추출을 병렬로 실행
    const [summaryCompletion, topicCompletion] = await Promise.all([
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: TOPIC_EXTRACTION_PROMPT },
          {
            role: 'user',
            content: `다음 상담 대화에서 토픽을 추출해주세요.

고객명: ${customerName || '고객'}

=== 대화 내용 ===
${transcript}
=== 대화 끝 ===`,
          },
        ],
        max_tokens: 1500,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    ]);

    const summary = summaryCompletion.choices[0]?.message?.content || '요약을 생성할 수 없습니다.';

    // 토픽 파싱
    let topics: ExtractedTopic[] = [];
    try {
      const topicContent = topicCompletion.choices[0]?.message?.content;
      if (topicContent) {
        const parsed = JSON.parse(topicContent) as TopicExtractionResponse;
        topics = (parsed.topics || []).map((topic) => ({
          ...topic,
          smsContent: topic.smsContent.replace(/{고객명}/g, customerName || '고객'),
        }));
      }
    } catch (parseError) {
      console.error('Topic parsing error:', parseError);
      // 토픽 파싱 실패 시 기본 토픽 생성
      topics = [
        {
          id: 'topic_default',
          type: 'general',
          title: '상담 안내',
          summary: '상담 내용을 확인해주세요',
          keyInfo: {},
          smsContent: `[SK텔레콤] 고객센터입니다.\n\n${customerName || '고객'}님, 상담이 완료되었습니다.\n\n※ T월드 앱에서 상세 내용 확인 가능\n문의: 114`,
        },
      ];
    }

    // 토픽이 없는 경우 기본 토픽 추가
    if (topics.length === 0) {
      topics = [
        {
          id: 'topic_default',
          type: 'general',
          title: '상담 안내',
          summary: '상담 내용을 확인해주세요',
          keyInfo: {},
          smsContent: `[SK텔레콤] 고객센터입니다.\n\n${customerName || '고객'}님, 상담이 완료되었습니다.\n\n※ T월드 앱에서 상세 내용 확인 가능\n문의: 114`,
        },
      ];
    }

    return NextResponse.json({
      summary,
      topics,
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
