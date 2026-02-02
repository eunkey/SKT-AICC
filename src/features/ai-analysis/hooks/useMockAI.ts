'use client';

import { useCallback } from 'react';
import { useAIAnalysisStore, AIAnalysisResult } from '@/stores';
import { useTranscriptStore } from '@/stores';
import { RelatedDocument } from '@/types/database';

interface AnalyzeAPIResponse {
  query: string;
  summary: string;
  keywords: string[];
  recommendedScript: string;
  timestamp: string;
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

export function useMockAI() {
  const { setLoading, setCurrentResult, setError } = useAIAnalysisStore();
  const { getFullText } = useTranscriptStore();

  const analyzeContext = useCallback(async (customQuery?: string) => {
    console.log('[AI분석] 분석 시작');
    setLoading(true);

    try {
      const conversationText = customQuery || getFullText();
      console.log('[AI분석] 대화 내용:', conversationText.substring(0, 100));

      // 대화 내용이 없는 경우 기본 응답
      if (!conversationText || conversationText.trim().length === 0) {
        const defaultResult: AIAnalysisResult = {
          id: `analysis-${Date.now()}`,
          query: '일반 상담',
          summary: '대화 내용이 없습니다. 고객과 대화를 시작해주세요.',
          documents: [],
          recommendedScript: '안녕하세요, SK텔레콤 고객센터입니다. 무엇을 도와드릴까요?',
          createdAt: new Date(),
        };
        setCurrentResult(defaultResult);
        return defaultResult;
      }

      // 1. AI 분석 API 호출
      console.log('[AI분석] API 호출 시작');
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: conversationText }),
      });

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json();
        throw new Error(errorData.error || 'AI 분석 API 오류');
      }

      const analyzeData: AnalyzeAPIResponse = await analyzeResponse.json();
      console.log('[AI분석] API 응답:', analyzeData.query, analyzeData.keywords);

      // 2. 키워드로 관련 문서 검색
      let documents: RelatedDocument[] = [];
      const searchKeyword = analyzeData.keywords[0];

      if (searchKeyword) {
        try {
          console.log('[AI분석] 문서 검색 시작:', searchKeyword);
          const searchResponse = await fetch(`/api/search?q=${encodeURIComponent(searchKeyword)}`);

          if (searchResponse.ok) {
            const searchData: SearchResponse = await searchResponse.json();
            console.log('[AI분석] 검색 결과:', searchData.totalResults, '건');

            if (searchData.results && searchData.results.length > 0) {
              documents = searchData.results.slice(0, 5).map((result, index) => ({
                title: result.title,
                url: result.filePath,
                relevance: Math.max(0.5, 1 - index * 0.1),
                focusSection: result.focusSection,
              }));
            }
          }
        } catch (searchError) {
          console.error('[AI분석] 문서 검색 실패:', searchError);
        }
      }

      // 3. 결과 반환
      const result: AIAnalysisResult = {
        id: `analysis-${Date.now()}`,
        query: analyzeData.query,
        summary: analyzeData.summary,
        documents,
        recommendedScript: analyzeData.recommendedScript,
        createdAt: new Date(),
      };

      console.log('[AI분석] 분석 완료');
      setCurrentResult(result);
      return result;
    } catch (error) {
      console.error('[AI분석] 오류 발생:', error);
      setError(error instanceof Error ? error.message : 'AI 분석 중 오류가 발생했습니다.');
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
