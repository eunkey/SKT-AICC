'use client';

import { useCallback } from 'react';
import { useAIAnalysisStore, AIAnalysisResult } from '@/stores';
import { useTranscriptStore } from '@/stores';
import { RelatedDocument } from '@/types/database';

interface MockAIResponse {
  generatedQuery: string;
  summary: string;
  documents: { title: string; url: string; relevance: number }[];
  recommendedScript: string;
}

interface SearchResult {
  filePath: string;
  title: string;
  category: string;
  matchedContent: string;
  matchCount: number;
  focusSection?: string;
}

interface SearchResponse {
  keyword: string;
  totalResults: number;
  results: SearchResult[];
}

// 대화 내용 기반 동적 스크립트 생성
function generateDynamicScript(conversationText: string, keyword: string | null): string {
  // 대화에서 마지막 고객 발화 추출
  const customerLines = conversationText.split('\n').filter(line => line.includes('[고객]'));
  const lastCustomerMessage = customerLines.length > 0
    ? customerLines[customerLines.length - 1].replace('[고객]', '').trim()
    : '';

  // 키워드별 동적 스크립트 생성
  if (keyword) {
    const scriptTemplates: Record<string, (msg: string) => string> = {
      '요금제': (msg) => {
        if (msg.includes('비싸') || msg.includes('저렴') || msg.includes('싼')) {
          return '고객님, 현재 사용하시는 데이터량을 확인해보니 더 합리적인 요금제가 있습니다. 5G 슬림 요금제는 월 59,000원으로, 사용 패턴에 맞게 추천드립니다.';
        }
        if (msg.includes('변경') || msg.includes('바꾸')) {
          return '고객님, 요금제 변경은 바로 처리 가능하며, 다음 달 1일부터 새 요금제가 적용됩니다. 원하시는 요금제가 있으시면 말씀해 주세요.';
        }
        if (msg.includes('추천')) {
          return '고객님의 최근 3개월 사용량을 분석해 보니, 데이터는 평균 15GB, 통화는 100분 정도 사용하셨네요. 5G 프라임 요금제를 추천드립니다.';
        }
        return '고객님, 요금제 관련 상담 도와드리겠습니다. 현재 사용하시는 요금제와 변경 희망하시는 요금제를 말씀해 주시겠어요?';
      },
      '로밍': (msg) => {
        if (msg.includes('일본') || msg.includes('중국') || msg.includes('아시아')) {
          return '고객님, 아시아 지역 여행이시군요. 아시아 로밍패스 7일권 33,000원을 추천드립니다. 3GB 데이터와 무제한 통화가 포함되어 있어요.';
        }
        if (msg.includes('미국') || msg.includes('유럽') || msg.includes('미주')) {
          return '고객님, 미주/유럽 지역은 로밍패스 7일권 55,000원을 추천드립니다. 출국 전 T월드 앱에서 미리 가입하시면 더 편리해요.';
        }
        if (msg.includes('얼마') || msg.includes('요금') || msg.includes('가격')) {
          return '고객님, 로밍 요금은 지역별로 다릅니다. baro로밍은 1일 12,000원이고, 로밍패스는 아시아 7일 33,000원, 미주/유럽 7일 55,000원입니다.';
        }
        return '고객님, 해외 로밍 서비스 안내드리겠습니다. 어느 국가로 여행하시는지, 기간은 얼마나 되시는지 말씀해 주시겠어요?';
      },
      '분실': (msg) => {
        if (msg.includes('찾') || msg.includes('위치')) {
          return '고객님, 분실폰 찾기 서비스를 도와드리겠습니다. T월드 앱의 "분실폰 찾기" 메뉴에서 위치 확인이 가능합니다. 지금 바로 확인해 드릴까요?';
        }
        if (msg.includes('정지') || msg.includes('차단')) {
          return '고객님, 즉시 회선 이용정지 처리 도와드리겠습니다. 본인 확인 후 바로 정지 처리해 드릴게요. 혹시 보험 가입 여부도 확인해 드릴까요?';
        }
        if (msg.includes('보험')) {
          return '고객님, T휴대폰 보험 가입 확인 결과 보험에 가입되어 계십니다. 분실 보상 청구는 T월드 앱 또는 고객센터에서 가능합니다.';
        }
        return '고객님, 휴대폰 분실로 불안하시겠어요. 우선 회선 정지 처리 도와드리고, 분실폰 찾기와 보험 관련 안내도 함께 드리겠습니다.';
      },
      '인터넷': (msg) => {
        if (msg.includes('설치') || msg.includes('신청')) {
          return '고객님, 인터넷 설치 신청 도와드리겠습니다. 주소 확인 후 가능한 상품과 설치 일정 안내드릴게요. 모바일과 결합하시면 최대 25% 할인됩니다.';
        }
        if (msg.includes('느려') || msg.includes('끊') || msg.includes('문제')) {
          return '고객님, 인터넷 품질 문제로 불편드려 죄송합니다. 원격으로 회선 상태 점검 먼저 진행하고, 필요시 기사님 방문 일정 잡아드릴게요.';
        }
        if (msg.includes('해지') || msg.includes('취소')) {
          return '고객님, 해지 전에 혹시 불편하신 부분이 있으셨는지 여쭤봐도 될까요? 개선해 드릴 수 있는 부분이 있다면 도움드리고 싶습니다.';
        }
        return '고객님, SK브로드밴드 인터넷 서비스 안내드리겠습니다. 어떤 부분이 궁금하신가요?';
      },
      '멤버십': (msg) => {
        if (msg.includes('포인트') || msg.includes('사용')) {
          return '고객님, 현재 T멤버십 포인트 잔액 확인해 드릴게요. 포인트는 편의점, 카페, 영화관 등 제휴사에서 바로 사용 가능합니다.';
        }
        if (msg.includes('등급') || msg.includes('혜택')) {
          return '고객님, 현재 등급은 골드이시며, 제휴사 15% 할인 혜택을 받으실 수 있습니다. T데이(9일, 19일, 29일)에는 추가 혜택도 있어요.';
        }
        return '고객님, T멤버십 관련 상담 도와드리겠습니다. 포인트 조회나 혜택 안내 중 어떤 것을 도와드릴까요?';
      },
      'T멤버십': (msg) => {
        if (msg.includes('포인트') || msg.includes('사용')) {
          return '고객님, 현재 T멤버십 포인트 잔액 확인해 드릴게요. 포인트는 편의점, 카페, 영화관 등 제휴사에서 바로 사용 가능합니다.';
        }
        if (msg.includes('등급') || msg.includes('혜택')) {
          return '고객님, 현재 등급은 골드이시며, 제휴사 15% 할인 혜택을 받으실 수 있습니다. T데이(9일, 19일, 29일)에는 추가 혜택도 있어요.';
        }
        return '고객님, T멤버십 관련 상담 도와드리겠습니다. 포인트 조회나 혜택 안내 중 어떤 것을 도와드릴까요?';
      },
      '보험': () => {
        return '고객님, T휴대폰 보험에 대해 안내드리겠습니다. 현재 가입 상태와 보장 내용을 확인해 드릴까요?';
      },
      '해지': () => {
        return '고객님, 해지 관련 문의시군요. 혹시 서비스 이용에 불편하신 점이 있으셨나요? 해지 전 확인해 드릴 사항이 있어서요.';
      },
      '번호이동': () => {
        return '고객님, 번호이동 관련 안내드리겠습니다. SK텔레콤으로 번호이동 시 다양한 혜택이 있으니 자세히 안내드릴게요.';
      },
    };

    const scriptGenerator = scriptTemplates[keyword];
    if (scriptGenerator) {
      return scriptGenerator(lastCustomerMessage);
    }
  }

  // 기본 스크립트
  return '고객님, 무엇을 도와드릴까요? 자세히 말씀해 주시면 정확한 안내를 도와드리겠습니다.';
}

// SK텔레콤 Mock AI 응답 데이터
const mockResponses: Record<string, MockAIResponse> = {
  default: {
    generatedQuery: '일반 상담 문의',
    summary: '고객이 일반적인 문의를 하고 있습니다. 친절하게 응대하며 필요한 정보를 제공해 주세요.',
    documents: [
      { title: 'SK텔레콤 고객 응대 가이드라인', url: '#', relevance: 0.85 },
      { title: '고객센터 FAQ 모음', url: '#', relevance: 0.75 },
    ],
    recommendedScript: '안녕하세요, SK텔레콤 고객센터입니다. 무엇을 도와드릴까요?',
  },
  '요금제': {
    generatedQuery: '요금제 변경 및 상담',
    summary: `요금제 관련 상담입니다. 다음 사항을 확인하세요:

1. **현재 요금제 확인**: 고객의 현재 요금제와 사용 패턴 파악
2. **니즈 파악**: 데이터/통화/문자 사용량 및 예산 확인
3. **추천 요금제 안내**:
   - 5G 프라임: 월 89,000원, 데이터 무제한
   - 5G 슬림: 월 59,000원, 데이터 8GB
   - LTE 프리미어 에센셜: 월 49,900원, 데이터 1.5GB
4. **변경 시점 안내**: 익월 1일부터 적용`,
    documents: [
      { title: '2024년 5G 요금제 안내서', url: '#', relevance: 0.95 },
      { title: '요금제 변경 프로세스 매뉴얼', url: '#', relevance: 0.90 },
      { title: 'LTE 요금제 비교표', url: '#', relevance: 0.85 },
    ],
    recommendedScript: '고객님, 현재 사용하시는 요금제는 5G 프라임이시고, 데이터 사용량이 적으시다면 5G 슬림 요금제를 추천드립니다. 월 59,000원에 8GB 제공되며, 다음 달 1일부터 적용됩니다.',
  },
  '로밍': {
    generatedQuery: '해외 로밍 서비스 안내',
    summary: `로밍 서비스 상담입니다:

1. **baro 로밍**: 별도 신청 없이 자동 적용, 데이터 1일 12,000원
2. **로밍 패스**:
   - 아시아 7일: 33,000원 (3GB)
   - 미주/유럽 7일: 55,000원 (3GB)
3. **T로밍 데이터**: 도착 후 현지에서 데이터만 사용
4. **주의사항**: 출국 전 로밍 설정 확인 필수`,
    documents: [
      { title: 'baro 로밍 서비스 가이드', url: '#', relevance: 0.95 },
      { title: '국가별 로밍 요금표 2024', url: '#', relevance: 0.92 },
      { title: '로밍 패스 상품 안내', url: '#', relevance: 0.88 },
    ],
    recommendedScript: '고객님, 해외에서 데이터 사용하시려면 baro 로밍 또는 로밍 패스 이용 가능합니다. 여행 기간과 방문 국가에 따라 적합한 상품 안내해 드릴게요.',
  },
  '분실': {
    generatedQuery: '휴대폰 분실 신고 및 정지',
    summary: `휴대폰 분실 신고 접수입니다:

1. **즉시 회선 정지**: 분실 확인 후 바로 처리
2. **분실폰 찾기**: T월드 앱 또는 삼성/애플 찾기 서비스 안내
3. **보험 확인**: T휴대폰 보험 가입 여부 확인
4. **임대폰 안내**: 필요시 임대폰 서비스 안내
5. **USIM 재발급**: 신규 기기 사용 시 USIM 발급 안내`,
    documents: [
      { title: '휴대폰 분실/정지 처리 매뉴얼', url: '#', relevance: 0.95 },
      { title: 'T휴대폰 보험 보상 절차', url: '#', relevance: 0.90 },
      { title: '임대폰 서비스 안내', url: '#', relevance: 0.82 },
    ],
    recommendedScript: '고객님, 휴대폰 분실로 걱정이 많으시겠네요. 우선 본인 확인 후 바로 회선 정지 처리 도와드리겠습니다. 혹시 T휴대폰 보험 가입하셨는지 확인해 드릴까요?',
  },
  '인터넷': {
    generatedQuery: 'SK브로드밴드 인터넷/TV 상담',
    summary: `SK브로드밴드 결합상품 상담입니다:

1. **결합 할인**: 모바일+인터넷+TV 결합 시 최대 25% 할인
2. **인터넷 상품**:
   - 기가라이트: 500Mbps, 월 33,000원
   - 기가프리미엄: 1Gbps, 월 38,500원
3. **B tv 상품**: 베이직/프라임/플래티넘
4. **설치 일정**: 신청 후 2-3일 내 설치 가능`,
    documents: [
      { title: 'SK브로드밴드 결합상품 안내', url: '#', relevance: 0.93 },
      { title: '인터넷 속도별 요금표', url: '#', relevance: 0.88 },
      { title: 'B tv 채널 구성표', url: '#', relevance: 0.80 },
    ],
    recommendedScript: '고객님, SK브로드밴드 인터넷과 모바일 결합하시면 최대 25% 할인 받으실 수 있어요. 현재 거주지 주소 확인해서 가능한 상품 안내해 드릴게요.',
  },
  'T멤버십': {
    generatedQuery: 'T멤버십 혜택 및 포인트',
    summary: `T멤버십 관련 상담입니다:

1. **등급별 혜택**:
   - 플래티넘: 제휴사 20% 할인
   - 골드: 제휴사 15% 할인
   - 실버: 제휴사 10% 할인
2. **포인트 적립**: 통신요금의 일정 비율 자동 적립
3. **포인트 사용처**: 편의점, 카페, 영화관, 주유소 등
4. **T데이**: 매월 9일, 19일, 29일 추가 혜택`,
    documents: [
      { title: 'T멤버십 등급별 혜택 안내', url: '#', relevance: 0.94 },
      { title: 'T멤버십 제휴사 목록', url: '#', relevance: 0.89 },
      { title: 'T데이 프로모션 가이드', url: '#', relevance: 0.85 },
    ],
    recommendedScript: '고객님, 현재 T멤버십 실버 등급이시고 포인트가 3,500점 적립되어 있습니다. T월드 앱이나 제휴 매장에서 바로 사용하실 수 있어요.',
  },
};

// 대화 내용에서 검색 키워드 추출
function extractSearchKeyword(text: string): string | null {
  const keywords = ['요금제', '로밍', '분실', '인터넷', 'T멤버십', '멤버십', '보험', '해지', '번호이동', '5G', 'LTE', 'BTV'];
  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      return keyword;
    }
  }
  return null;
}

export function useMockAI() {
  const { setLoading, setCurrentResult, setError } = useAIAnalysisStore();
  const { getFullText } = useTranscriptStore();

  const analyzeContext = useCallback(async (customQuery?: string) => {
    console.log('[AI분석] 분석 시작');
    setLoading(true);

    try {
      // 대화 내용에서 키워드 추출
      const conversationText = customQuery || getFullText();
      console.log('[AI분석] 대화 내용:', conversationText.substring(0, 100));

      const searchKeyword = extractSearchKeyword(conversationText);
      console.log('[AI분석] 추출된 키워드:', searchKeyword);

      // 키워드 매칭으로 응답 선택
      let response = mockResponses.default;
      for (const [keyword, mockResponse] of Object.entries(mockResponses)) {
        if (keyword !== 'default' && conversationText.includes(keyword)) {
          response = mockResponse;
          break;
        }
      }

      // 실제 문서 검색 수행 (키워드가 있는 경우)
      let documents: RelatedDocument[] = response.documents;
      if (searchKeyword) {
        try {
          console.log('[AI분석] 문서 검색 시작:', searchKeyword);
          const searchResponse = await fetch(`/api/search?q=${encodeURIComponent(searchKeyword)}`);
          if (searchResponse.ok) {
            const data: SearchResponse = await searchResponse.json();
            console.log('[AI분석] 검색 결과:', data.totalResults, '건');
            if (data.results && data.results.length > 0) {
              // 검색 결과를 RelatedDocument 형식으로 변환 (focusSection 포함)
              documents = data.results.slice(0, 5).map((result, index) => ({
                title: result.title,
                url: result.filePath,
                relevance: Math.max(0.5, 1 - index * 0.1),
                focusSection: result.focusSection,
              }));
            }
          }
        } catch (searchError) {
          console.error('[AI분석] 문서 검색 실패:', searchError);
          // 검색 실패 시 mock 문서 사용
        }
      }

      // 대화 내용 기반 동적 스크립트 생성
      const dynamicScript = generateDynamicScript(conversationText, searchKeyword);

      const result: AIAnalysisResult = {
        id: `analysis-${Date.now()}`,
        query: response.generatedQuery,
        summary: response.summary,
        documents,
        recommendedScript: dynamicScript,
        createdAt: new Date(),
      };

      console.log('[AI분석] 분석 완료');
      setCurrentResult(result);
      return result;
    } catch (error) {
      console.error('[AI분석] 오류 발생:', error);
      setError('AI 분석 중 오류가 발생했습니다.');
      return null;
    }
  }, [setLoading, setCurrentResult, setError, getFullText]);

  const reanalyzeWithQuery = useCallback(async (query: string) => {
    return analyzeContext(query);
  }, [analyzeContext]);

  return {
    analyzeContext,
    reanalyzeWithQuery,
  };
}
