import { useEffect, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import TicketCard from '../../components/TicketCard';
import { useMatchDayStore } from '../../store/useMatchDayStore';
import { useVoice } from '../../context/VoiceContext';
import { DoorOpen, Mic, RefreshCw } from 'lucide-react';

const GateBadge = memo(({ gate }) => (
  <span className="px-4 py-2 bg-gradient-to-r from-pink-500 to-blue-600 text-white rounded-xl font-bold text-sm shadow-md transition-transform duration-150 hover:scale-105">
    {gate}
  </span>
));
GateBadge.displayName = 'GateBadge';

const StepItem = memo(({ step, idx }) => (
  <li className="flex items-start gap-3">
    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-blue-600 text-sm font-bold text-white shadow-md">
      {idx + 1}
    </span>
    <span className="pt-0.5 text-base font-semibold leading-relaxed text-neutral-200">{step}</span>
  </li>
));
StepItem.displayName = 'StepItem';

export default function ExitPlanCard() {
  const { exitPlan, setExitPlan } = useMatchDayStore();
  const { toggleCall, callActive } = useVoice();

  const { data } = useQuery({
    queryKey: ['exit-plan-latest'],
    queryFn: async () => {
      const res = await fetch('/api/exit-plan/latest');
      if (!res.ok) throw new Error('Failed to fetch exit plan');
      const json = await res.json();
      return json.data ?? null;
    },
    refetchInterval: 3000,
    staleTime: 2000,
  });

  useEffect(() => {
    if (data && data.generatedAt !== exitPlan?.generatedAt) {
      setExitPlan(data);
    }
  }, [data, exitPlan?.generatedAt, setExitPlan]);

  return (
    <TicketCard className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-pink-500 shadow-md">
          <DoorOpen className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold bg-gradient-to-r from-blue-300 to-pink-400 bg-clip-text text-transparent md:text-2xl">
            Exit Plan
          </h3>
          <p className="text-sm font-semibold text-neutral-400">
            {exitPlan ? 'Your personalized guide' : 'Get your custom exit plan'}
          </p>
        </div>
      </div>

      {exitPlan ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-yellow-500/15 via-green-500/15 to-blue-500/15 p-5">
            <h4 className="mb-4 font-display text-lg font-bold text-white">{exitPlan.title}</h4>

            <div className="mb-5">
              <span className="mb-3 block text-xs font-semibold uppercase tracking-wider text-neutral-400">Recommended Gates</span>
              <div className="flex flex-wrap gap-2">
                {exitPlan.recommendedGates.map((gate) => (
                  <GateBadge key={gate} gate={gate} />
                ))}
              </div>
            </div>

            <div>
              <span className="mb-3 block text-xs font-semibold uppercase tracking-wider text-neutral-400">Your Steps</span>
              <ul className="space-y-3">
                {exitPlan.steps.map((step, idx) => (
                  <StepItem key={step} step={step} idx={idx} />
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={() => setExitPlan(null)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-white/10 to-white/5 py-3 text-sm font-bold text-neutral-200 transition-all duration-200 hover:bg-white/15 active:scale-98"
          >
            <RefreshCw className="h-4 w-4" />
            Get a New Exit Plan
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border-4 border-dashed border-pink-500/30 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 p-6 text-center">
          <Mic className="mx-auto mb-4 h-12 w-12 text-pink-400" />
          <h4 className="mb-3 font-display text-xl font-bold text-white">Get a Personalized Exit Plan!</h4>
          <p className="mx-auto mb-5 max-w-sm text-sm leading-relaxed text-neutral-400">
            Tap the mic button and ask our AI concierge for an exit plan tailored to your needs!
          </p>
          <button
            onClick={toggleCall}
            disabled={callActive}
            className={`mx-auto flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95 ${
              callActive
                ? 'bg-gradient-to-r from-green-500 to-teal-600'
                : 'bg-gradient-to-r from-pink-500 to-blue-600 shadow-[0_6px_20px_rgba(236,72,153,0.3)]'
            }`}
          >
            <Mic className="h-4 w-4" />
            {callActive ? 'Voice Call Active' : 'Ask AI for Exit Plan'}
          </button>
        </div>
      )}
    </TicketCard>
  );
}
