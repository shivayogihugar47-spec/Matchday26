import { useEffect, useRef } from 'react';
import TicketCard from '../../components/TicketCard';
import { useMatchDayStore } from '../../store/useMatchDayStore';
import { useVoiceConcierge } from '../../hooks/useVoiceConcierge';
import { motion, AnimatePresence } from 'framer-motion';
import { DoorOpen, Mic, RefreshCw } from 'lucide-react';

export default function ExitPlanCard() {
  const { exitPlan, setExitPlan } = useMatchDayStore();
  const { toggleCall, callActive } = useVoiceConcierge();
  const lastFetchedAtRef = useRef(null);

  useEffect(() => {
    const fetchLatestExitPlan = async () => {
      try {
        const res = await fetch('/api/exit-plan/latest');
        const data = await res.json();
        if (data.data && data.data.generatedAt !== lastFetchedAtRef.current) {
          lastFetchedAtRef.current = data.data.generatedAt;
          setExitPlan(data.data);
        }
      } catch (e) {
        console.error('Failed to fetch latest exit plan:', e);
      }
    };

    const intervalId = setInterval(fetchLatestExitPlan, 2000);
    return () => clearInterval(intervalId);
  }, [setExitPlan]);

  return (
    <TicketCard className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
          <DoorOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-display text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-300 to-pink-400 bg-clip-text text-transparent">
            Exit Plan
          </h3>
          <p className="text-neutral-400 text-sm font-semibold">
            {exitPlan ? 'Your personalized guide' : 'Get your custom exit plan'}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {exitPlan ? (
          <motion.div
            key="plan"
            initial={{ opacity: 0, y: 25, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.97 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            {/* Plan Title */}
            <div className="bg-gradient-to-br from-yellow-500/20 via-green-500/20 to-blue-500/20 p-5 rounded-2xl border border-white/10">
              <h4 className="font-display text-lg font-bold text-white mb-4">
                {exitPlan.title}
              </h4>
              
              {/* Recommended Gates */}
              <div className="mb-5">
                <span className="text-neutral-400 font-semibold text-xs uppercase tracking-wider mb-3 block">
                  Recommended Gates
                </span>
                <div className="flex flex-wrap gap-2">
                  {exitPlan.recommendedGates.map((gate, idx) => (
                    <motion.span
                      key={`gate-${idx}-${gate}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.08, y: -2 }}
                      className="px-4 py-2 bg-gradient-to-r from-pink-500 to-blue-600 text-white rounded-xl font-bold text-sm shadow-md"
                    >
                      {gate}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div>
                <span className="text-neutral-400 font-semibold text-xs uppercase tracking-wider mb-3 block">
                  Your Steps
                </span>
                <ul className="space-y-3">
                  {exitPlan.steps.map((step, idx) => (
                    <motion.li
                      key={`step-${idx}`}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.12 }}
                      className="flex items-start gap-3"
                    >
                      <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-md">
                        {idx + 1}
                      </span>
                      <span className="text-base text-neutral-200 leading-relaxed font-semibold pt-0.5">
                        {step}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Reset Button */}
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setExitPlan(null);
                lastFetchedAtRef.current = null;
              }}
              className="w-full bg-gradient-to-r from-white/10 to-white/5 text-neutral-200 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all border border-white/10 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Get a New Exit Plan
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="cta"
            initial={{ opacity: 0, y: 25, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.97 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-br from-pink-500/15 via-purple-500/15 to-blue-500/15 p-6 rounded-2xl border-4 border-dashed border-pink-500/30 text-center"
          >
            <div className="text-5xl mb-4">
              <Mic className="w-12 h-12 mx-auto text-pink-400" />
            </div>
            <h4 className="font-display text-xl font-bold text-white mb-3">
              Get a Personalized Exit Plan!
            </h4>
            <p className="text-neutral-400 text-sm mb-5 max-w-sm mx-auto leading-relaxed">
              Tap the mic button and ask our AI concierge for an exit plan tailored to your needs!
            </p>
            <motion.button
              whileHover={{ scale: 1.08, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCall}
              disabled={callActive}
              className={`px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mx-auto ${
                callActive
                  ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white'
                  : 'bg-gradient-to-r from-pink-500 to-blue-600 text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
              {callActive ? 'Voice Call Active' : 'Ask AI for Exit Plan'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </TicketCard>
  );
}
