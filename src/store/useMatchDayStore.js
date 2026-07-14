// @ts-check
/**
 * @fileoverview Global application state store for MatchDay 26.
 *
 * Built with Zustand for minimal re-render overhead.
 * All state mutations go through the actions defined here — components never
 * mutate state directly.
 *
 * @module useMatchDayStore
 */

import { create } from 'zustand';

/**
 * @typedef {'PRE_MATCH' | 'LIVE_MATCH' | 'POST_MATCH'} MatchPhase
 * @typedef {'en' | 'es' | 'fr' | 'de' | 'pt' | 'hi'} SupportedLanguage
 * @typedef {'disconnected' | 'connected' | 'listening' | 'speaking' | 'thinking'} VoiceStatus
 *
 * @typedef {Object} UserLocation
 * @property {number} lat - Latitude coordinate.
 * @property {number} lon - Longitude coordinate.
 *
 * @typedef {Object} ExitPlan
 * @property {string}   title              - Human-readable plan title.
 * @property {string}   transportMethod    - 'train' | 'bus' | 'parking' | 'uber'.
 * @property {string[]} recommendedGates   - List of recommended exit gate names.
 * @property {string[]} steps              - Ordered list of exit steps.
 * @property {string}   generatedAt        - ISO 8601 timestamp.
 */

/**
 * @typedef {Object} MatchDayState
 * @property {MatchPhase}        phase               - Current match phase.
 * @property {SupportedLanguage} language            - Active UI language.
 * @property {boolean}           accessibilityMode   - Accessibility mode toggle.
 * @property {VoiceStatus}       voiceStatus         - Vapi voice call state.
 * @property {boolean}           developerPanelOpen  - Developer debug panel visibility.
 * @property {UserLocation|null} userLocation        - Fan's current GPS coordinates.
 * @property {string}            selectedGate        - Currently selected gate name.
 * @property {ExitPlan|null}     exitPlan            - Active personalised exit plan.
 *
 * @property {(phase: MatchPhase) => void}           setPhase
 * @property {(language: SupportedLanguage) => void} setLanguage
 * @property {() => void}                            toggleAccessibilityMode
 * @property {(status: VoiceStatus) => void}         setVoiceStatus
 * @property {() => void}                            toggleDeveloperPanel
 * @property {(location: UserLocation) => void}      setUserLocation
 * @property {(gate: string) => void}                setSelectedGate
 * @property {(exitPlan: ExitPlan|null) => void}     setExitPlan
 */

/**
 * Global Zustand store.
 * Import and call `useMatchDayStore` inside any React component or hook.
 *
 * @type {import('zustand').UseBoundStore<import('zustand').StoreApi<MatchDayState>>}
 */
export const useMatchDayStore = create((set) => ({
  /** @type {MatchPhase} */
  phase: 'PRE_MATCH',

  /** @type {SupportedLanguage} */
  language: 'en',

  /** Whether the fan has enabled accessibility-first routing */
  accessibilityMode: false,

  /** @type {VoiceStatus} */
  voiceStatus: 'disconnected',

  /** Controls visibility of the developer debug panel */
  developerPanelOpen: false,

  /** @type {UserLocation|null} */
  userLocation: null,

  /** Currently selected stadium gate — used for Vapi system prompt injection */
  selectedGate: 'Verizon Gate',

  /** @type {ExitPlan|null} */
  exitPlan: null,

  // ── Actions ──────────────────────────────────────────────────────────────

  /** @param {MatchPhase} phase */
  setPhase: (phase) => set({ phase }),

  /** @param {SupportedLanguage} language */
  setLanguage: (language) => set({ language }),

  /** Toggles accessibility mode on/off */
  toggleAccessibilityMode: () => set((state) => ({ accessibilityMode: !state.accessibilityMode })),

  /** @param {VoiceStatus} status */
  setVoiceStatus: (status) => set({ voiceStatus: status }),

  /** Toggles the developer debug panel */
  toggleDeveloperPanel: () => set((state) => ({ developerPanelOpen: !state.developerPanelOpen })),

  /** @param {UserLocation} location */
  setUserLocation: (location) => set({ userLocation: location }),

  /** @param {string} gate */
  setSelectedGate: (gate) => set({ selectedGate: gate }),

  /** @param {ExitPlan|null} exitPlan */
  setExitPlan: (exitPlan) => set({ exitPlan }),
}));
