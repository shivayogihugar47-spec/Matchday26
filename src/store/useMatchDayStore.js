import { create } from 'zustand';

export const useMatchDayStore = create((set) => ({
  phase: 'PRE_MATCH',
  language: 'en',
  accessibilityMode: false,
  voiceStatus: 'disconnected', // idle, listening, thinking, speaking, disconnected
  developerPanelOpen: false,
  userLocation: null, // { lat: number, lon: number }
  selectedGate: 'Verizon Gate', // Default to Verizon Gate
  exitPlan: null, // { title, transportMethod, recommendedGates, steps, generatedAt }
  setPhase: (phase) => set({ phase }),
  setLanguage: (language) => set({ language }),
  toggleAccessibilityMode: () => set((state) => ({ accessibilityMode: !state.accessibilityMode })),
  setVoiceStatus: (status) => set({ voiceStatus: status }),
  toggleDeveloperPanel: () => set((state) => ({ developerPanelOpen: !state.developerPanelOpen })),
  setUserLocation: (location) => set({ userLocation: location }),
  setSelectedGate: (gate) => set({ selectedGate: gate }),
  setExitPlan: (exitPlan) => set({ exitPlan }),
}));
