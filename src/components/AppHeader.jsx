import LanguageSelector from './LanguageSelector';
import AccessibilityToggle from './AccessibilityToggle';
import { useVoiceConcierge } from '../hooks/useVoiceConcierge';
import { motion } from 'framer-motion';
import { Trophy, Mic, MicOff, Activity } from 'lucide-react';

export default function AppHeader() {
  const {
    isConnecting,
    callActive,
    toggleCall
  } = useVoiceConcierge();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/5 px-4 py-4 shadow-[0_25px_90px_rgba(2,6,23,0.4)] backdrop-blur-xl">
          {/* FIFA 2026 Colorful Accents */}
          <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rotate-45 bg-gradient-to-br from-lime-400 to-yellow-400 opacity-30 blur-2xl" />
          <div className="pointer-events-none absolute -right-8 -bottom-8 h-32 w-32 rotate-45 bg-gradient-to-br from-sky-500 to-blue-600 opacity-30 blur-2xl" />
          
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 via-red-500 to-sky-500 shadow-lg shadow-red-500/30 overflow-hidden"
              >
                <img src="/logo.png" alt="MatchDay 26 Logo" className="h-8 w-8 object-contain" />
              </motion.div>
              <div>
                <h1 className="font-display text-2xl font-extrabold tracking-tight bg-gradient-to-r from-lime-300 via-yellow-300 to-sky-400 bg-clip-text text-transparent lg:text-3xl">
                  MatchDay 26
                </h1>
                <p className="mt-0.5 text-xs text-slate-400 lg:text-sm">
                  FIFA World Cup 2026 · USA · CAN · MEX
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300 sm:flex">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-lime-400" />
                Arena mode
              </div>
              <LanguageSelector />
              <AccessibilityToggle />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleCall}
                disabled={isConnecting || !import.meta.env.VITE_VAPI_PUBLIC_KEY || !import.meta.env.VITE_VAPI_ASSISTANT_ID}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 font-medium text-white transition-all shadow-[0_10px_25px_rgba(2,6,23,0.22)] ${
                  isConnecting ? 'bg-gradient-to-br from-yellow-400 to-red-500 animate-pulse' :
                  callActive ? 'bg-gradient-to-br from-lime-500 to-sky-500' :
                  'bg-gradient-to-br from-yellow-400 via-red-500 to-sky-500'
                } ${(!import.meta.env.VITE_VAPI_PUBLIC_KEY || !import.meta.env.VITE_VAPI_ASSISTANT_ID) ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {isConnecting ? <Activity className="h-4 w-4 text-white animate-spin" /> : 
                 callActive ? <MicOff className="h-4 w-4 text-white" /> : 
                 <Mic className="h-4 w-4 text-white" />}
                <span className="hidden text-sm sm:inline">
                  {isConnecting ? 'Connecting' : callActive ? 'Stop Voice' : 'Voice Concierge'}
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
