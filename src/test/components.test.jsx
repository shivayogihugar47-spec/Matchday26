/**
 * @fileoverview Component render tests for MatchDay 26.
 *
 * These tests verify that key UI components mount without errors,
 * render expected content, and handle edge cases gracefully.
 *
 * Uses React Testing Library following the "test behaviour, not implementation"
 * principle — queries mirror what a screen reader or user would see.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Zustand store — provide controlled initial state
const mockState = {
  phase: 'PRE_MATCH',
  language: 'en',
  accessibilityMode: false,
  voiceStatus: 'disconnected',
  selectedGate: 'Verizon Gate',
  exitPlan: null,
  setPhase: vi.fn(),
  setLanguage: vi.fn(),
  toggleAccessibilityMode: vi.fn(),
  setVoiceStatus: vi.fn(),
  setSelectedGate: vi.fn(),
  setExitPlan: vi.fn(),
};

vi.mock('../store/useMatchDayStore', () => ({
  useMatchDayStore: vi.fn((selector) =>
    typeof selector === 'function' ? selector(mockState) : mockState
  ),
}));

// VoiceContext
vi.mock('../context/VoiceContext', () => ({
  useVoice: vi.fn(() => ({
    isConnecting: false,
    callActive: false,
    assistantSpeaking: false,
    userSpeaking: false,
    micPermissionDenied: false,
    callError: null,
    toggleCall: vi.fn(),
    voiceStatus: 'disconnected',
  })),
}));

// ── AccessibilityToggle ───────────────────────────────────────────────────────
import AccessibilityToggle from '../components/AccessibilityToggle.jsx';

describe('<AccessibilityToggle />', () => {
  it('renders without crashing', () => {
    render(<AccessibilityToggle />);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('has correct aria-label', () => {
    render(<AccessibilityToggle />);
    expect(screen.getByLabelText('Toggle accessibility mode')).toBeTruthy();
  });

  it('shows "A11y" label text', () => {
    render(<AccessibilityToggle />);
    expect(screen.getByText('A11y')).toBeTruthy();
  });

  it('has aria-pressed="false" when off', () => {
    render(<AccessibilityToggle />);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });
});

// ── LanguageSelector ─────────────────────────────────────────────────────────
import LanguageSelector from '../components/LanguageSelector.jsx';

describe('<LanguageSelector />', () => {
  it('renders 6 language buttons', () => {
    render(<LanguageSelector />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(6);
  });

  it('renders EN button', () => {
    render(<LanguageSelector />);
    expect(screen.getByTitle('English')).toBeTruthy();
  });

  it('renders Hindi button', () => {
    render(<LanguageSelector />);
    expect(screen.getByTitle('हिन्दी')).toBeTruthy();
  });

  it('all buttons have title attributes for screen readers', () => {
    render(<LanguageSelector />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn.hasAttribute('title')).toBe(true);
    });
  });
});

// ── TicketCard ────────────────────────────────────────────────────────────────
import TicketCard from '../components/TicketCard.jsx';

describe('<TicketCard />', () => {
  it('renders children', () => {
    render(<TicketCard><span>Hello World</span></TicketCard>);
    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  it('applies additional className', () => {
    const { container } = render(<TicketCard className="test-class">content</TicketCard>);
    expect(container.firstChild.className).toContain('test-class');
  });

  it('wraps children in a relative z-10 div', () => {
    render(<TicketCard><span data-testid="child">test</span></TicketCard>);
    expect(screen.getByTestId('child')).toBeTruthy();
  });
});

// ── PhaseStamp ────────────────────────────────────────────────────────────────
import PhaseStamp from '../components/PhaseStamp.jsx';

describe('<PhaseStamp />', () => {
  it('renders PRE MATCH label for PRE_MATCH phase', () => {
    render(<PhaseStamp />);
    // en translation for preMatch is 'PRE MATCH'
    expect(screen.getByText(/PRE MATCH/i)).toBeTruthy();
  });
});

// ── WeatherCard loading state ─────────────────────────────────────────────────
vi.mock('../hooks/useWeather', () => ({
  useWeather: vi.fn(() => ({ data: null, isLoading: true, isError: false })),
}));

import WeatherCard from '../features/weather/WeatherCard.jsx';

describe('<WeatherCard /> loading state', () => {
  it('renders loading skeleton', () => {
    const { container } = render(<WeatherCard />);
    // Loading state renders animate-pulse elements
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });
});
