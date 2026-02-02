import { create } from 'zustand';

export interface TranscriptEntry {
  id: string;
  speaker: 'customer' | 'counselor';
  text: string;
  isFinal: boolean;
  timestamp: Date;
}

interface TranscriptState {
  transcripts: TranscriptEntry[];
  isStreaming: boolean;
  currentInterim: TranscriptEntry | null;

  // Actions
  addTranscript: (entry: TranscriptEntry) => void;
  updateInterim: (entry: TranscriptEntry | null) => void;
  finalizeInterim: () => void;
  setStreaming: (streaming: boolean) => void;
  clearTranscripts: () => void;
  getFullText: () => string;
}

export const useTranscriptStore = create<TranscriptState>((set, get) => ({
  transcripts: [],
  isStreaming: false,
  currentInterim: null,

  addTranscript: (entry) =>
    set((state) => ({
      transcripts: [...state.transcripts, entry],
    })),

  updateInterim: (entry) =>
    set({
      currentInterim: entry || null,
    }),

  finalizeInterim: () =>
    set((state) => {
      if (state.currentInterim) {
        return {
          transcripts: [...state.transcripts, { ...state.currentInterim, isFinal: true }],
          currentInterim: null,
        };
      }
      return state;
    }),

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  clearTranscripts: () =>
    set({
      transcripts: [],
      currentInterim: null,
    }),

  getFullText: () => {
    const state = get();
    return state.transcripts
      .filter((t) => t.isFinal)
      .map((t) => `[${t.speaker === 'customer' ? '고객' : '상담사'}] ${t.text}`)
      .join('\n');
  },
}));
