import { create } from "zustand";

export type PanelState = "code" | "console" | "chat" | "state";

interface InterviewState {
  // Timer State
  timeLeft: number;
  timerStatus: "idle" | "running" | "paused" | "completed";
  startTimer: () => void;
  pauseTimer: () => void;
  tickTimer: () => void;
  setTimeLeft: (seconds: number) => void;

  // Media State
  isMicMuted: boolean;
  toggleMic: () => void;

  // Editor State
  activeLanguage: string;
  setActiveLanguage: (lang: string) => void;
  
  // UI Panels Mobile State
  activeMobilePanel: PanelState;
  setActiveMobilePanel: (panel: PanelState) => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  // Timer
  timeLeft: 45 * 60, // 45 minutes default
  timerStatus: "idle",
  startTimer: () => set({ timerStatus: "running" }),
  pauseTimer: () => set({ timerStatus: "paused" }),
  tickTimer: () => set((state) => ({ 
    timeLeft: Math.max(0, state.timeLeft - 1),
    timerStatus: state.timeLeft <= 1 ? "completed" : state.timerStatus
  })),
  setTimeLeft: (seconds) => set({ timeLeft: seconds }),

  // Media
  isMicMuted: true,
  toggleMic: () => set((state) => ({ isMicMuted: !state.isMicMuted })),

  // Editor
  activeLanguage: "python",
  setActiveLanguage: (lang) => set({ activeLanguage: lang }),

  // Layout
  activeMobilePanel: "code",
  setActiveMobilePanel: (panel) => set({ activeMobilePanel: panel }),
}));
