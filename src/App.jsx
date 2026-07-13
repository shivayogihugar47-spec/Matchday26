import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppHeader from './components/AppHeader';
import WeatherCard from './features/weather/WeatherCard';
import MatchCard from './features/match/MatchCard';
import QuickActions from './components/QuickActions';
import './App.css';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

const Concierge = lazy(() => import('./features/concierge/Concierge'));
const StadiumShops = lazy(() => import('./components/StadiumShops'));
const CrowdReportPanel = lazy(() => import('./features/congestion/CrowdReportPanel'));
const MapPanel = lazy(() => import('./components/MapPanel'));
const DeveloperPanel = lazy(() => import('./components/DeveloperPanel'));

// Create a client
const queryClient = new QueryClient();

const spotlightStats = [
  { label: 'Arrival', value: '08:30' },
  { label: 'Gate', value: 'B14' },
  { label: 'Flow', value: 'Low' }
];

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen overflow-x-hidden app-shell">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,215,0,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.13),_transparent_36%)]" />
        <AppHeader />
        <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <section className="mb-10">
            <div className="mb-8 flex flex-col items-center gap-5 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(2,6,23,0.25)] lg:flex-row lg:items-center lg:justify-between lg:p-8">
              <div className="max-w-2xl text-center lg:text-left">
                <div className="glass-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-300">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-400" />
                  Fan experience
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Elevate every stadium moment with a sharper, calmer interface.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                  Track the match, weather, crowd flow, and your next move from a single polished dashboard.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {spotlightStats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 shadow-[0_12px_35px_rgba(2,6,23,0.25)] sm:px-4 sm:py-3">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-slate-400 sm:text-[10px]">{item.label}</p>
                    <p className="mt-1 text-base font-semibold text-white sm:text-lg">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-gradient-to-br from-yellow-500/15 to-transparent blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-gradient-to-br from-blue-500/15 to-transparent blur-3xl" />

              <div className="flex w-full flex-col gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full"
                >
                  <MatchCard />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08 }}
                  className="w-full"
                >
                  <WeatherCard />
                </motion.div>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-sky-500 shadow-lg shadow-sky-500/30">
                <Bot className="h-5 w-5 text-yellow-950" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold bg-gradient-to-r from-amber-300 via-sky-400 to-cyan-300 bg-clip-text text-transparent">
                  Talk to Our MatchDay Agent
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Get instant help, info about the game, stadium, and everything in between.
                </p>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full"
            >
              <Suspense fallback={<div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-sm text-slate-400">Loading concierge…</div>}>
                <Concierge />
              </Suspense>
            </motion.div>
          </section>

          <section className="mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-full"
            >
              <QuickActions />
            </motion.div>
          </section>

          <section className="mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="w-full"
            >
              <Suspense fallback={<div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-sm text-slate-400">Loading crowd map…</div>}>
                <CrowdReportPanel />
              </Suspense>
            </motion.div>
          </section>

          <section className="mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="w-full"
            >
              <Suspense fallback={<div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-sm text-slate-400">Loading shops…</div>}>
                <StadiumShops />
              </Suspense>
            </motion.div>
          </section>

          <section className="mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="w-full"
            >
              <Suspense fallback={<div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-sm text-slate-400">Loading map…</div>}>
                <MapPanel />
              </Suspense>
            </motion.div>
          </section>
        </main>

        <Suspense fallback={null}>
          <DeveloperPanel />
        </Suspense>
      </div>
    </QueryClientProvider>
  );
}

export default App;
