import { motion } from 'framer-motion';
import { useMatchDayStore } from '../store/useMatchDayStore';
import { languageTranslations } from '../services/mockData';
import { Clock, Zap, PartyPopper } from 'lucide-react';

export default function PhaseStamp() {
  const { phase, language } = useMatchDayStore();
  const t = languageTranslations[language];
  const phaseLabel = phase === 'PRE_MATCH' ? t.preMatch : phase === 'LIVE_MATCH' ? t.liveMatch : t.postMatch;
  
  const getPhaseConfig = () => {
    switch (phase) {
      case 'PRE_MATCH':
        return { 
          bg: 'from-blue-500 to-blue-700', 
          text: 'text-white',
          icon: <Clock className="w-4 h-4" />,
          color: 'blue'
        };
      case 'LIVE_MATCH':
        return { 
          bg: 'from-green-500 to-green-700', 
          text: 'text-white',
          icon: <Zap className="w-4 h-4" />,
          color: 'green'
        };
      case 'POST_MATCH':
        return { 
          bg: 'from-yellow-500 to-yellow-700', 
          text: 'text-white',
          icon: <PartyPopper className="w-4 h-4" />,
          color: 'yellow'
        };
      default:
        return { 
          bg: 'from-yellow-500 to-yellow-700', 
          text: 'text-white',
          icon: <Clock className="w-4 h-4" />,
          color: 'yellow'
        };
    }
  };

  const config = getPhaseConfig();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        inline-flex items-center gap-2
        px-3 py-1.5
        rounded-lg
        font-display
        font-bold
        text-sm
        bg-gradient-to-br ${config.bg}
        ${config.text}
        shadow-md
        border border-white/20
      `}
    >
      {config.icon}
      <span className="uppercase tracking-wider">{phaseLabel}</span>
    </motion.div>
  );
}
