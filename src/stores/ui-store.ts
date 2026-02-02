import { create } from 'zustand';

type ModalType = 'wrap-up' | 'sms-preview' | 'settings' | null;

interface UIState {
  zoneBExpanded: boolean;
  activeModal: ModalType;
  sidebarOpen: boolean;
  isJumpToLiveVisible: boolean;

  // Actions
  toggleZoneB: () => void;
  setZoneBExpanded: (expanded: boolean) => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setJumpToLiveVisible: (visible: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  zoneBExpanded: true,
  activeModal: null,
  sidebarOpen: false,
  isJumpToLiveVisible: false,

  toggleZoneB: () =>
    set((state) => ({ zoneBExpanded: !state.zoneBExpanded })),

  setZoneBExpanded: (expanded) => set({ zoneBExpanded: expanded }),

  openModal: (modal) => set({ activeModal: modal }),

  closeModal: () => set({ activeModal: null }),

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setJumpToLiveVisible: (visible) => set({ isJumpToLiveVisible: visible }),
}));
