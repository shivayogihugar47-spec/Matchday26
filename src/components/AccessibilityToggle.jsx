import { useMatchDayStore } from '../store/useMatchDayStore';
import { motion } from 'framer-motion';
import { Accessibility } from 'lucide-react';

export default function AccessibilityToggle() {
  const { accessibilityMode, toggleAccessibilityMode } = useMatchDayStore();

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleAccessibilityMode}
      aria-pressed={accessibilityMode}
      aria-label="Toggle accessibility mode"
      className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-[12px] font-semibold transition-all ${
        accessibilityMode
          ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.25)]'
          : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Accessibility className="h-4 w-4 flex-shrink-0" />
      <span className="hidden sm:inline">{accessibilityMode ? 'A11y On' : 'A11y'}</span>
    </motion.button>
  );
}
