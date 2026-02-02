'use client';

import { useEffect, useRef } from 'react';
import { useAddressStore } from '@/stores/address-store';
import { detectAddressPattern } from '../utils/address-utils';
import type { AddressSearchResponse } from '@/types/address';

interface UseAddressDetectionProps {
  transcriptId: string;
  text: string;
  isFinal: boolean;
  role: 'user' | 'assistant';
}

export function useAddressDetection({
  transcriptId,
  text,
  isFinal,
  role,
}: UseAddressDetectionProps) {
  const { startSearch, setResults, setError, getSearch } = useAddressStore();
  const hasDetectedRef = useRef(false);

  useEffect(() => {
    // 이미 감지했거나, 확정되지 않았거나, 고객 메시지가 아니면 무시
    if (hasDetectedRef.current || !isFinal || role !== 'user') {
      return;
    }

    // 이미 검색 중이면 무시
    if (getSearch(transcriptId)) {
      return;
    }

    // 주소 패턴 감지
    const detectedAddress = detectAddressPattern(text);
    if (!detectedAddress) {
      return;
    }

    // 중복 감지 방지
    hasDetectedRef.current = true;

    // 검색 시작
    startSearch(transcriptId, detectedAddress);

    // API 호출
    const params = new URLSearchParams({
      keyword: detectedAddress,
      currentPage: '1',
      countPerPage: '10',
    });

    fetch(`/api/address/search?${params.toString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json() as Promise<AddressSearchResponse>;
      })
      .then((data) => {
        if (data.success && data.results) {
          setResults(transcriptId, data.results.juso || []);
        } else {
          setError(transcriptId, data.error || '주소 검색에 실패했습니다');
        }
      })
      .catch((error) => {
        console.error('[Address Detection] API error:', error);
        setError(transcriptId, '네트워크 오류가 발생했습니다');
      });
  }, [transcriptId, text, isFinal, role, startSearch, setResults, setError, getSearch]);

  return {
    search: getSearch(transcriptId),
  };
}
