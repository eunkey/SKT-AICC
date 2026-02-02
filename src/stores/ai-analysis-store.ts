import { create } from 'zustand';
import { RelatedDocument } from '@/types/database';

export interface AIAnalysisResult {
  id: string;
  query: string;
  summary: string;
  documents: RelatedDocument[];
  recommendedScript: string;
  createdAt: Date;
}

interface AIAnalysisState {
  currentResult: AIAnalysisResult | null;
  history: AIAnalysisResult[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setCurrentResult: (result: AIAnalysisResult) => void;
  addToHistory: (result: AIAnalysisResult) => void;
  clearHistory: () => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAIAnalysisStore = create<AIAnalysisState>((set) => ({
  currentResult: null,
  history: [],
  isLoading: false,
  error: null,

  setLoading: (isLoading) => set({ isLoading, error: null }),

  setCurrentResult: (result) =>
    set((state) => ({
      currentResult: result,
      history: [result, ...state.history],
      isLoading: false,
    })),

  addToHistory: (result) =>
    set((state) => ({
      history: [result, ...state.history],
    })),

  clearHistory: () => set({ history: [], currentResult: null }),

  setError: (error) => set({ error, isLoading: false }),

  reset: () =>
    set({
      currentResult: null,
      history: [],
      isLoading: false,
      error: null,
    }),
}));
