import { create } from 'zustand';

type ModalType = 'wrap-up' | 'sms-preview' | 'settings' | null;

export interface SelectedDocument {
  filePath: string;
  title: string;
  content: string;
}

interface UIState {
  zoneBExpanded: boolean;
  activeModal: ModalType;
  sidebarOpen: boolean;
  isJumpToLiveVisible: boolean;
  selectedDocument: SelectedDocument | null;
  selectedScenarioId: string | null;

  // Actions
  toggleZoneB: () => void;
  setZoneBExpanded: (expanded: boolean) => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setJumpToLiveVisible: (visible: boolean) => void;
  setSelectedDocument: (doc: SelectedDocument | null) => void;
  setSelectedScenarioId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  zoneBExpanded: true,
  activeModal: null,
  sidebarOpen: false,
  isJumpToLiveVisible: false,
  selectedDocument: null,
  selectedScenarioId: null,

  toggleZoneB: () =>
    set((state) => ({ zoneBExpanded: !state.zoneBExpanded })),

  setZoneBExpanded: (expanded) => set({ zoneBExpanded: expanded }),

  openModal: (modal) => set({ activeModal: modal }),

  closeModal: () => set({ activeModal: null }),

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setJumpToLiveVisible: (visible) => set({ isJumpToLiveVisible: visible }),

  setSelectedDocument: (doc) => set({ selectedDocument: doc }),

  setSelectedScenarioId: (id) => set({ selectedScenarioId: id }),
}));
