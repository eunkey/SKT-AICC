'use client';

import { useCallback } from 'react';
import { useAIAnalysisStore, AIAnalysisResult } from '@/stores';
import { useTranscriptStore } from '@/stores';

interface MockAIResponse {
  generatedQuery: string;
  summary: string;
  documents: { title: string; url: string; relevance: number }[];
  recommendedScript: string;
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

export function useMockAI() {
  const { setLoading, setCurrentResult, setError } = useAIAnalysisStore();
  const { getFullText } = useTranscriptStore();

  const analyzeContext = useCallback(async (customQuery?: string) => {
    setLoading(true);

    try {
      // 로딩 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

      // 대화 내용에서 키워드 추출
      const conversationText = customQuery || getFullText();

      // 키워드 매칭으로 응답 선택
      let response = mockResponses.default;
      for (const [keyword, mockResponse] of Object.entries(mockResponses)) {
        if (keyword !== 'default' && conversationText.includes(keyword)) {
          response = mockResponse;
          break;
        }
      }

      const result: AIAnalysisResult = {
        id: `analysis-${Date.now()}`,
        query: response.generatedQuery,
        summary: response.summary,
        documents: response.documents,
        recommendedScript: response.recommendedScript,
        createdAt: new Date(),
      };

      setCurrentResult(result);
      return result;
    } catch (error) {
      setError('AI 분석 중 오류가 발생했습니다.');
      throw error;
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
