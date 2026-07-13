/**
 * Tests for src/store/useMatchDayStore.js
 * Covers all store actions and initial state
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useMatchDayStore } from '../store/useMatchDayStore.js';

// Reset store between tests
beforeEach(() => {
  useMatchDayStore.setState({
    phase: 'PRE_MATCH',
    language: 'en',
    accessibilityMode: false,
    voiceStatus: 'disconnected',
    developerPanelOpen: false,
    userLocation: null,
    selectedGate: 'Verizon Gate',
    exitPlan: null,
  });
});

describe('initial state', () => {
  it('phase defaults to PRE_MATCH', () => {
    expect(useMatchDayStore.getState().phase).toBe('PRE_MATCH');
  });
  it('language defaults to en', () => {
    expect(useMatchDayStore.getState().language).toBe('en');
  });
  it('accessibilityMode defaults to false', () => {
    expect(useMatchDayStore.getState().accessibilityMode).toBe(false);
  });
  it('voiceStatus defaults to disconnected', () => {
    expect(useMatchDayStore.getState().voiceStatus).toBe('disconnected');
  });
  it('selectedGate defaults to Verizon Gate', () => {
    expect(useMatchDayStore.getState().selectedGate).toBe('Verizon Gate');
  });
  it('exitPlan defaults to null', () => {
    expect(useMatchDayStore.getState().exitPlan).toBeNull();
  });
  it('userLocation defaults to null', () => {
    expect(useMatchDayStore.getState().userLocation).toBeNull();
  });
});

describe('setPhase()', () => {
  it('updates phase to LIVE_MATCH', () => {
    useMatchDayStore.getState().setPhase('LIVE_MATCH');
    expect(useMatchDayStore.getState().phase).toBe('LIVE_MATCH');
  });
  it('updates phase to POST_MATCH', () => {
    useMatchDayStore.getState().setPhase('POST_MATCH');
    expect(useMatchDayStore.getState().phase).toBe('POST_MATCH');
  });
});

describe('setLanguage()', () => {
  it('updates language', () => {
    useMatchDayStore.getState().setLanguage('es');
    expect(useMatchDayStore.getState().language).toBe('es');
  });
  it('supports all 6 languages', () => {
    ['en', 'es', 'fr', 'de', 'pt', 'hi'].forEach((lang) => {
      useMatchDayStore.getState().setLanguage(lang);
      expect(useMatchDayStore.getState().language).toBe(lang);
    });
  });
});

describe('toggleAccessibilityMode()', () => {
  it('toggles from false to true', () => {
    useMatchDayStore.getState().toggleAccessibilityMode();
    expect(useMatchDayStore.getState().accessibilityMode).toBe(true);
  });
  it('toggles back to false', () => {
    useMatchDayStore.getState().toggleAccessibilityMode();
    useMatchDayStore.getState().toggleAccessibilityMode();
    expect(useMatchDayStore.getState().accessibilityMode).toBe(false);
  });
});

describe('setVoiceStatus()', () => {
  it('updates voiceStatus', () => {
    useMatchDayStore.getState().setVoiceStatus('connected');
    expect(useMatchDayStore.getState().voiceStatus).toBe('connected');
  });
  it('accepts all valid statuses', () => {
    ['disconnected', 'connected', 'listening', 'speaking', 'thinking'].forEach((s) => {
      useMatchDayStore.getState().setVoiceStatus(s);
      expect(useMatchDayStore.getState().voiceStatus).toBe(s);
    });
  });
});

describe('setSelectedGate()', () => {
  it('updates selectedGate', () => {
    useMatchDayStore.getState().setSelectedGate('AMEX Gate');
    expect(useMatchDayStore.getState().selectedGate).toBe('AMEX Gate');
  });
});

describe('setUserLocation()', () => {
  it('stores lat/lon', () => {
    useMatchDayStore.getState().setUserLocation({ lat: 40.8135, lon: -74.0745 });
    const loc = useMatchDayStore.getState().userLocation;
    expect(loc.lat).toBe(40.8135);
    expect(loc.lon).toBe(-74.0745);
  });
});

describe('setExitPlan()', () => {
  it('stores an exit plan', () => {
    const plan = {
      title: 'Train exit',
      transportMethod: 'train',
      recommendedGates: ['AMEX Gate'],
      steps: ['Walk to gate', 'Board train'],
      generatedAt: new Date().toISOString(),
    };
    useMatchDayStore.getState().setExitPlan(plan);
    expect(useMatchDayStore.getState().exitPlan).toEqual(plan);
  });
  it('can be cleared by setting null', () => {
    useMatchDayStore.getState().setExitPlan({ title: 'test' });
    useMatchDayStore.getState().setExitPlan(null);
    expect(useMatchDayStore.getState().exitPlan).toBeNull();
  });
});

describe('toggleDeveloperPanel()', () => {
  it('toggles developerPanelOpen', () => {
    expect(useMatchDayStore.getState().developerPanelOpen).toBe(false);
    useMatchDayStore.getState().toggleDeveloperPanel();
    expect(useMatchDayStore.getState().developerPanelOpen).toBe(true);
    useMatchDayStore.getState().toggleDeveloperPanel();
    expect(useMatchDayStore.getState().developerPanelOpen).toBe(false);
  });
});
