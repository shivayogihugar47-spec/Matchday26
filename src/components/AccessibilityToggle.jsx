import { useMatchDayStore } from '../store/useMatchDayStore';
import { motion } from 'framer-motion';
import { Accessibility } from 'lucide-react';

export default function AccessibilityToggle() {
  const { accessibilityMode, toggleAccessibilityMode } = useMatchDayStore();
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleAccessibilityMode}
      className={`
        flex items-center gap-2
        px-3 py-2
        rounded-xl
        font-medium
        text-sm
        transition-all
        border
        ${
          accessibilityMode 
            ? 'bg-gradient-to-r from-green-500 to-green-700 border-white/40 shadow-md text-white' 
            : 'bg-white/5 border-white/10 hover:bg-white/10 text-neutral-200'
        }
      `}
    >
      <Accessibility className="w-4 h-4" />
      <span className="hidden sm:inline">Accessibility</span>
    </motion.button>
  );
}
