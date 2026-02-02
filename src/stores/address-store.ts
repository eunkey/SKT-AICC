import { create } from 'zustand';
import type { AddressResult, AddressSearchState } from '@/types/address';

interface AddressStore {
  /**
   * transcriptId별 검색 상태 맵
   */
  searches: Map<string, AddressSearchState>;

  /**
   * 주소 검색 시작
   */
  startSearch: (transcriptId: string, keyword: string) => void;

  /**
   * 검색 결과 설정
   */
  setResults: (transcriptId: string, results: AddressResult[]) => void;

  /**
   * 검색 에러 설정
   */
  setError: (transcriptId: string, error: string) => void;

  /**
   * 검색 상태 초기화
   */
  clearSearch: (transcriptId: string) => void;

  /**
   * 특정 transcriptId의 검색 상태 가져오기
   */
  getSearch: (transcriptId: string) => AddressSearchState | undefined;
}

export const useAddressStore = create<AddressStore>((set, get) => ({
  searches: new Map(),

  startSearch: (transcriptId, keyword) => {
    set((state) => {
      const newSearches = new Map(state.searches);
      newSearches.set(transcriptId, {
        keyword,
        results: [],
        loading: true,
        error: null,
      });
      return { searches: newSearches };
    });
  },

  setResults: (transcriptId, results) => {
    set((state) => {
      const newSearches = new Map(state.searches);
      const existingSearch = newSearches.get(transcriptId);
      if (existingSearch) {
        newSearches.set(transcriptId, {
          ...existingSearch,
          results,
          loading: false,
          error: null,
        });
      }
      return { searches: newSearches };
    });
  },

  setError: (transcriptId, error) => {
    set((state) => {
      const newSearches = new Map(state.searches);
      const existingSearch = newSearches.get(transcriptId);
      if (existingSearch) {
        newSearches.set(transcriptId, {
          ...existingSearch,
          error,
          loading: false,
        });
      }
      return { searches: newSearches };
    });
  },

  clearSearch: (transcriptId) => {
    set((state) => {
      const newSearches = new Map(state.searches);
      newSearches.delete(transcriptId);
      return { searches: newSearches };
    });
  },

  getSearch: (transcriptId) => {
    return get().searches.get(transcriptId);
  },
}));
