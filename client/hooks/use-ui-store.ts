import { create } from "zustand";

interface UIState {
  // Navigation State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;

  // Modal State
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;

  // Onboarding UI State
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  nextOnboardingStep: () => void;
  prevOnboardingStep: () => void;

  // Temporary Workflow State
  isProcessing: boolean;
  processingMessage: string;
  setProcessingState: (isProcessing: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Navigation State
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  // Modal State
  activeModal: null,
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),

  // Onboarding UI State
  onboardingStep: 1,
  setOnboardingStep: (step) => set({ onboardingStep: step }),
  nextOnboardingStep: () => set((state) => ({ onboardingStep: state.onboardingStep + 1 })),
  prevOnboardingStep: () => set((state) => ({ onboardingStep: Math.max(1, state.onboardingStep - 1) })),

  // Temporary Workflow State
  isProcessing: false,
  processingMessage: "",
  setProcessingState: (isProcessing, message = "") =>
    set({ isProcessing, processingMessage: message }),
}));
