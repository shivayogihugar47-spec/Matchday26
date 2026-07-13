import { useState } from 'react';
import AccessibilityToggle from './AccessibilityToggle';
import { useVoice } from '../context/VoiceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Activity, Menu, X, Zap } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Match',     href: '#match'   },
  { label: 'Weather',   href: '#weather' },
  { label: 'Concierge', href: '#concierge' },
  { label: 'Crowd Map', href: '#crowd'   },
  { label: 'Shops',     href: '#shops'   },
];

const VAPI_READY =
  !!import.meta.env.VITE_VAPI_PUBLIC_KEY &&
  !!import.meta.env.VITE_VAPI_ASSISTANT_ID;

export default function AppHeader() {
  const { isConnecting, callActive, toggleCall } = useVoice();
  const [menuOpen, setMenuOpen] = useState(false);

  const voiceLabel = isConnecting ? 'Connecting…' : callActive ? 'End Call' : 'Voice AI';
  const VoiceIcon  = isConnecting ? Activity : callActive ? MicOff : Mic;

  return (
    <header className="sticky top-0 z-50">
      {/* ── Frosted bar ── */}
      <div className="border-b border-white/[0.07] bg-slate-950/80 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]">

            {/* ── Left: logo + wordmark ── */}
            <motion.a
              href="#"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-shrink-0 items-center gap-3"
            >
              <div className="relative flex-shrink-0">
                {/* Glow halo behind logo */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-lime-400/30 to-sky-500/30 blur-lg" />
                <img
                  src="/logo.png"
                  alt="MatchDay 26"
                  className="relative h-10 w-10 rounded-xl object-contain sm:h-11 sm:w-11"
                />
              </div>
              <div className="leading-none">
                <span className="block font-display text-lg font-extrabold tracking-tight bg-gradient-to-r from-lime-300 via-yellow-300 to-sky-400 bg-clip-text text-transparent sm:text-xl lg:text-2xl">
                  MatchDay 26
                </span>
                <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.32em] text-slate-500 sm:text-[10px]">
                  FIFA World Cup 2026
                </span>
              </div>
            </motion.a>

            {/* ── Centre: nav links (hidden on mobile) ── */}
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-slate-400 transition-colors hover:bg-white/8 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* ── Right: live badge + accessibility + voice + hamburger ── */}
            <div className="flex items-center gap-2 sm:gap-2.5">

              {/* Live indicator — desktop only */}
              <div className="hidden items-center gap-1.5 rounded-full border border-lime-400/20 bg-lime-400/8 px-3 py-1.5 sm:flex">
                <span className="h-2 w-2 animate-pulse rounded-full bg-lime-400" />
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-lime-300">Live</span>
              </div>

              {/* Accessibility toggle */}
              <AccessibilityToggle />

              {/* Voice CTA */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleCall}
                disabled={isConnecting || !VAPI_READY}
                className={`relative flex items-center gap-2 overflow-hidden rounded-full px-4 py-2 text-[13px] font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                  isConnecting
                    ? 'animate-pulse bg-gradient-to-r from-amber-400 to-orange-500'
                    : callActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                    : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-rose-500 shadow-[0_8px_24px_rgba(249,115,22,0.35)]'
                }`}
              >
                {/* Shimmer on idle */}
                {!callActive && !isConnecting && (
                  <motion.div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
                  />
                )}
                <VoiceIcon className={`relative h-4 w-4 flex-shrink-0 ${isConnecting ? 'animate-spin' : ''}`} />
                <span className="relative hidden sm:inline">{voiceLabel}</span>
              </motion.button>

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 lg:hidden"
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile nav drawer ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="border-b border-white/[0.07] bg-slate-950/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
              {/* Live pill + nav links stacked */}
              <div className="mb-4 flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full border border-lime-400/20 bg-lime-400/8 px-3 py-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-lime-400" />
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
                    className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
