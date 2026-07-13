import { useState } from 'react';
import AccessibilityToggle from './AccessibilityToggle';
import { useVoice } from '../context/VoiceContext';
import { Mic, MicOff, Activity, Menu, X, Zap } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Match',     href: '#match'     },
  { label: 'Weather',   href: '#weather'   },
  { label: 'Concierge', href: '#concierge' },
  { label: 'Crowd Map', href: '#crowd'     },
  { label: 'Shops',     href: '#shops'     },
];

const VAPI_READY =
  !!import.meta.env.VITE_VAPI_PUBLIC_KEY &&
  !!import.meta.env.VITE_VAPI_ASSISTANT_ID;

export default function AppHeader() {
  const { isConnecting, callActive, toggleCall } = useVoice();
  const [menuOpen, setMenuOpen] = useState(false);

  const VoiceIcon = isConnecting ? Activity : callActive ? MicOff : Mic;
  const voiceLabel = isConnecting ? 'Connecting…' : callActive ? 'End Call' : 'Voice AI';

  return (
    <header className="sticky top-0 z-50">
      {/* ── Main bar ── */}
      <div className="border-b border-white/[0.07] bg-slate-950/95 md:bg-slate-950/85 md:backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]">

            {/* Logo + wordmark */}
            <a href="#" className="flex flex-shrink-0 items-center gap-3 transition-opacity hover:opacity-85">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-lime-400/25 to-sky-500/25 blur-md" />
                <img
                  src="/logo.png"
                  alt="MatchDay 26"
                  className="relative h-9 w-9 rounded-xl object-contain sm:h-10 sm:w-10"
                />
              </div>
              <div className="leading-none">
                <span className="block font-display text-lg font-extrabold tracking-tight bg-gradient-to-r from-lime-300 via-yellow-300 to-sky-400 bg-clip-text text-transparent sm:text-xl lg:text-2xl">
                  MatchDay 26
                </span>
                <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.3em] text-slate-500 sm:text-[10px]">
                  FIFA World Cup 2026
                </span>
              </div>
            </a>

            {/* Centre nav — desktop only */}
            <nav className="hidden items-center gap-0.5 lg:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-slate-400 transition-colors duration-150 hover:bg-white/8 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* Live dot — desktop */}
              <div className="hidden items-center gap-1.5 rounded-full border border-lime-400/20 bg-lime-400/8 px-3 py-1.5 sm:flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-400" />
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-lime-300">Live</span>
              </div>

              <AccessibilityToggle />

              {/* Voice button */}
              <button
                onClick={toggleCall}
                disabled={isConnecting || !VAPI_READY}
                className={`relative flex items-center gap-2 overflow-hidden rounded-full px-4 py-2 text-[13px] font-bold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                  isConnecting
                    ? 'animate-pulse bg-gradient-to-r from-amber-400 to-orange-500'
                    : callActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_18px_rgba(16,185,129,0.35)]'
                    : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-rose-500 shadow-[0_6px_20px_rgba(249,115,22,0.3)] hover:shadow-[0_8px_28px_rgba(249,115,22,0.45)] hover:opacity-95'
                }`}
              >
                <VoiceIcon className={`h-4 w-4 flex-shrink-0 ${isConnecting ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{voiceLabel}</span>
              </button>

              {/* Hamburger — mobile */}
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      <div
        className={`overflow-hidden border-b border-white/[0.07] bg-slate-950 transition-all duration-200 lg:hidden ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-lime-400/20 bg-lime-400/8 px-3 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-lime-300">Live</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Zap className="h-3 w-3 text-amber-300" />
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-300">Arena mode</span>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
