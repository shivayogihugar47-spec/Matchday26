import { useMatchDayStore } from '../store/useMatchDayStore';
import { languageTranslations } from '../services/mockData';
import { Clock, Zap, PartyPopper } from 'lucide-react';

const PHASE_CONFIG = {
  PRE_MATCH:  { bg: 'from-blue-500 to-blue-700',    icon: <Clock className="w-4 h-4" /> },
  LIVE_MATCH: { bg: 'from-green-500 to-green-700',  icon: <Zap className="w-4 h-4" /> },
  POST_MATCH: { bg: 'from-yellow-500 to-yellow-700',icon: <PartyPopper className="w-4 h-4" /> },
};

export default function PhaseStamp() {
  const { phase, language } = useMatchDayStore();
  const t = languageTranslations[language];
  const label = phase === 'PRE_MATCH' ? t.preMatch : phase === 'LIVE_MATCH' ? t.liveMatch : t.postMatch;
  const { bg, icon } = PHASE_CONFIG[phase] || PHASE_CONFIG.PRE_MATCH;

  return (
    <div className={`inline-flex items-center gap-2 rounded-lg border border-white/20 bg-gradient-to-br ${bg} px-3 py-1.5 text-sm font-bold font-display text-white shadow-md`}>
      {icon}
      <span className="uppercase tracking-wider">{label}</span>
    </div>
  );
}
