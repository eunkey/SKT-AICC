import { create } from 'zustand';

export type CallStatus = 'idle' | 'connecting' | 'active' | 'hold' | 'wrap-up';

export interface CustomerInfo {
  name: string;
  phone: string;
  customerId?: string;
  plan?: string;
  planPrice?: string;
  contractType?: string;
  services?: string[];
}

interface CallState {
  callStatus: CallStatus;
  customerInfo: CustomerInfo | null;
  callDuration: number;
  sessionId: string | null;
  startedAt: Date | null;

  // Actions
  startCall: (sessionId: string, customerInfo: CustomerInfo) => void;
  endCall: () => void;
  holdCall: () => void;
  resumeCall: () => void;
  startWrapUp: () => void;
  updateDuration: (duration: number) => void;
  setCallStatus: (status: CallStatus) => void;
  reset: () => void;
}

const initialState = {
  callStatus: 'idle' as CallStatus,
  customerInfo: null,
  callDuration: 0,
  sessionId: null,
  startedAt: null,
};

export const useCallStore = create<CallState>((set) => ({
  ...initialState,

  startCall: (sessionId, customerInfo) =>
    set({
      callStatus: 'active',
      sessionId,
      customerInfo,
      callDuration: 0,
      startedAt: new Date(),
    }),

  endCall: () =>
    set((state) => ({
      callStatus: 'wrap-up',
      startedAt: state.startedAt,
    })),

  holdCall: () => set({ callStatus: 'hold' }),

  resumeCall: () => set({ callStatus: 'active' }),

  startWrapUp: () => set({ callStatus: 'wrap-up' }),

  updateDuration: (duration) => set({ callDuration: duration }),

  setCallStatus: (status) => set({ callStatus: status }),

  reset: () => set(initialState),
}));
