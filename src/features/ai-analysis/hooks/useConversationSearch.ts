'use client';

import { useCallback } from 'react';
import { useTranscriptStore, useAIAnalysisStore } from '@/stores';
import { RelatedDocument } from '@/types/database';
import { extractDictionaryKeywords, getDictionaryPriority } from '@/lib/skt-dictionary';

interface SearchResult {
  filePath: string;
  title: string;
  category: string;
  matchedContent: string;
  matchCount: number;
}

interface SearchResponse {
  keyword: string;
  totalResults: number;
  results: SearchResult[];
}

// 대화 내용에서 키워드 추출
function extractKeywords(text: string): string[] {
  const keywords: string[] = [];

  // 딕셔너리 기반 키워드 추출 (별칭 → 정식 상품명)
  const dictionaryKeywords = extractDictionaryKeywords(text);
  keywords.push(...dictionaryKeywords);

  // SK텔레콤 관련 키워드 패턴 (딕셔너리에 없는 일반 키워드)
  const patterns = [
    // 요금제 관련
    /요금제|플랜|5G|LTE|무제한|데이터/g,
    // 로밍 관련
    /로밍|해외|여행|바로로밍|로밍패스/g,
    // 분실/보험 관련
    /분실|도난|보험|파손|수리/g,
    // 멤버십 관련
    /멤버십|T멤버십|포인트|혜택|등급|VIP/g,
    // 인터넷/TV 관련
    /인터넷|브로드밴드|BTV|와이파이|공유기|설치/g,
    // 서비스 관련
    /해지|변경|가입|신청|취소|번호이동/g,
    // 기기 관련
    /아이폰|갤럭시|휴대폰|단말기|기기변경/g,
    // 청구 관련
    /요금|청구|납부|할인|결합|가족/g,
    // 매장 관련
    /매장|대리점|서비스센터/g,
    // T world 관련
    /티월드|T world|앱|어플/g,
  ];

  patterns.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) {
      keywords.push(...matches);
    }
  });

  // 중복 제거
  return [...new Set(keywords)];
}

// 키워드 우선순위 결정 (가장 관련성 높은 키워드 선택)
function prioritizeKeywords(keywords: string[]): string {
  const priority: Record<string, number> = {
    // 높은 우선순위
    '로밍': 10, '해외': 10, '바로로밍': 10,
    '분실': 10, '도난': 10, '보험': 9,
    '요금제': 8, '플랜': 8, '5G': 7, 'LTE': 7,
    '해지': 8, '번호이동': 8,
    '멤버십': 6, 'T멤버십': 6,
    '인터넷': 6, 'BTV': 6,
    // 낮은 우선순위
    '데이터': 3, '요금': 3, '할인': 3,
  };

  if (keywords.length === 0) return '';

  // 딕셔너리 기반 우선순위와 기존 우선순위를 결합
  const sorted = [...keywords].sort((a, b) => {
    const dictPriorityA = getDictionaryPriority(a);
    const dictPriorityB = getDictionaryPriority(b);
    const staticPriorityA = priority[a] || 1;
    const staticPriorityB = priority[b] || 1;
    // 딕셔너리 우선순위가 있으면 그것을 사용, 없으면 기존 우선순위
    const finalA = dictPriorityA > 0 ? dictPriorityA : staticPriorityA;
    const finalB = dictPriorityB > 0 ? dictPriorityB : staticPriorityB;
    return finalB - finalA;
  });

  return sorted[0];
}

export function useConversationSearch() {
  const { getFullText } = useTranscriptStore();
  const { setLoading, setCurrentResult, setError } = useAIAnalysisStore();

  const searchFromConversation = useCallback(async () => {
    const fullText = getFullText();

    if (!fullText || fullText.trim().length === 0) {
      setError('분석할 대화 내용이 없습니다.');
      return null;
    }

    setLoading(true);

    try {
      // 1. 키워드 추출
      const keywords = extractKeywords(fullText);
      const primaryKeyword = prioritizeKeywords(keywords);

      if (!primaryKeyword) {
        setError('대화 내용에서 관련 키워드를 찾을 수 없습니다.');
        return null;
      }

      // 2. 문서 검색
      const response = await fetch(`/api/search?q=${encodeURIComponent(primaryKeyword)}`);

      if (!response.ok) {
        throw new Error('검색 실패');
      }

      const data: SearchResponse = await response.json();

      // 3. 결과 변환
      const documents: RelatedDocument[] = data.results.slice(0, 5).map((result, index) => ({
        title: result.title,
        url: result.filePath,
        relevance: Math.max(0.5, 1 - index * 0.1), // 검색 순서 기반 관련도
      }));

      // 4. AI 분석 결과 생성
      const result = {
        id: `analysis-${Date.now()}`,
        query: primaryKeyword,
        summary: generateSummary(fullText, primaryKeyword),
        documents,
        recommendedScript: generateScript(primaryKeyword),
        createdAt: new Date(),
      };

      setCurrentResult(result);
      return result;
    } catch (error) {
      console.error('Conversation search failed:', error);
      setError('문서 검색 중 오류가 발생했습니다.');
      return null;
    }
  }, [getFullText, setLoading, setCurrentResult, setError]);

  return { searchFromConversation };
}

// 간단한 요약 생성
function generateSummary(text: string, keyword: string): string {
  const summaries: Record<string, string> = {
    '로밍': '고객님께서 해외 로밍 서비스에 대해 문의하고 계십니다. 로밍 요금제, 데이터 사용량, 이용 가능 국가 등을 안내해 드리세요.',
    '해외': '해외에서의 통신 서비스 이용에 관한 문의입니다. 로밍 상품 및 이용 방법을 안내해 주세요.',
    '바로로밍': '바로로밍 서비스에 대한 문의입니다. 바로로밍 가입 방법, 요금, 이용 가능 국가를 안내해 주세요.',
    '분실': '휴대폰 분실 관련 문의입니다. 분실 신고 절차, 위치 추적, 이용 정지 방법을 안내해 주세요.',
    '도난': '휴대폰 도난 관련 문의입니다. 도난 신고 절차와 보험 청구 방법을 안내해 주세요.',
    '보험': '휴대폰 보험 관련 문의입니다. 보험 가입 조건, 보상 범위, 청구 절차를 안내해 주세요.',
    '요금제': '요금제 관련 문의입니다. 현재 이용 가능한 요금제와 혜택을 비교하여 안내해 주세요.',
    '5G': '5G 요금제에 대한 문의입니다. 5G 요금제 종류와 혜택을 안내해 주세요.',
    'LTE': 'LTE 요금제에 대한 문의입니다. LTE 요금제 종류와 혜택을 안내해 주세요.',
    '해지': '서비스 해지 관련 문의입니다. 해지 절차, 위약금, 유의사항을 안내해 주세요.',
    '번호이동': '번호이동 관련 문의입니다. 번호이동 절차와 혜택을 안내해 주세요.',
    '멤버십': 'T멤버십 관련 문의입니다. 등급별 혜택과 포인트 적립/사용 방법을 안내해 주세요.',
    'T멤버십': 'T멤버십 관련 문의입니다. 등급별 혜택과 포인트 적립/사용 방법을 안내해 주세요.',
    '인터넷': '인터넷 서비스 관련 문의입니다. 인터넷 상품과 결합 할인을 안내해 주세요.',
    'BTV': 'BTV 서비스 관련 문의입니다. BTV 상품과 결합 할인을 안내해 주세요.',
  };

  return summaries[keyword] || `고객님께서 "${keyword}"에 대해 문의하고 계십니다. 관련 정보를 확인하여 안내해 주세요.`;
}

// 간단한 스크립트 생성
function generateScript(keyword: string): string {
  const scripts: Record<string, string> = {
    '로밍': '고객님, 해외 로밍 서비스에 대해 안내 드리겠습니다. 방문하시는 국가와 여행 기간을 말씀해 주시면 최적의 로밍 상품을 추천해 드리겠습니다.',
    '해외': '고객님, 해외에서 이용 가능한 통신 서비스에 대해 안내 드리겠습니다. 어느 국가에 방문하실 예정이신가요?',
    '바로로밍': '고객님, 바로로밍 서비스는 별도 가입 없이 해외에서 바로 이용 가능한 서비스입니다. 이용 요금과 방법에 대해 자세히 안내 드릴까요?',
    '분실': '고객님, 휴대폰 분실로 불편을 드려 죄송합니다. 먼저 분실 신고를 진행해 드리고, 위치 추적 서비스와 임시 이용 정지에 대해 안내 드리겠습니다.',
    '도난': '고객님, 휴대폰 도난으로 불편을 드려 죄송합니다. 경찰 신고와 함께 이용 정지 및 보험 청구 절차에 대해 안내 드리겠습니다.',
    '보험': '고객님, 휴대폰 보험에 대해 안내 드리겠습니다. 현재 가입하신 보험 상품의 보장 내용과 청구 방법을 확인해 드릴까요?',
    '요금제': '고객님, 요금제 변경에 대해 안내 드리겠습니다. 현재 사용하시는 데이터량과 통화량을 고려하여 최적의 요금제를 추천해 드리겠습니다.',
    '5G': '고객님, 5G 요금제에 대해 안내 드리겠습니다. 5G 서비스의 빠른 속도와 다양한 혜택을 경험해 보세요.',
    'LTE': '고객님, LTE 요금제에 대해 안내 드리겠습니다. 합리적인 가격으로 이용하실 수 있는 다양한 요금제가 준비되어 있습니다.',
    '해지': '고객님, 서비스 해지에 대해 안내 드리겠습니다. 혹시 불편하셨던 부분이 있으시면 말씀해 주시겠어요? 개선해 드릴 수 있는 부분이 있는지 확인해 보겠습니다.',
    '멤버십': '고객님, T멤버십 서비스에 대해 안내 드리겠습니다. 현재 고객님의 등급은 확인해 드릴까요?',
    '인터넷': '고객님, 인터넷 서비스에 대해 안내 드리겠습니다. 휴대폰과 결합 시 추가 할인 혜택도 받으실 수 있습니다.',
  };

  return scripts[keyword] || `고객님, "${keyword}"에 대해 자세히 안내 드리겠습니다. 어떤 부분이 궁금하신가요?`;
}
