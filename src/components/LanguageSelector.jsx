import { useMatchDayStore } from '../store/useMatchDayStore';
import { motion } from 'framer-motion';

export default function LanguageSelector() {
  const { language, setLanguage } = useMatchDayStore();
  
  const languages = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'es', label: 'ES', name: 'Español' },
    { code: 'fr', label: 'FR', name: 'Français' },
    { code: 'de', label: 'DE', name: 'Deutsch' },
    { code: 'pt', label: 'PT', name: 'Português' },
    { code: 'hi', label: 'HI', name: 'हिन्दी' }
  ];
  
  return (
    <div className="flex gap-1.5">
      {languages.map((lang) => (
        <motion.button
          key={lang.code}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLanguage(lang.code)}
          className={`
            w-8 h-8
            rounded-lg
            text-xs
            font-bold
            transition-all
            flex items-center justify-center
            border
            ${
              language === lang.code 
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-white/40 shadow-md text-white' 
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-neutral-300'
            }
          `}
          title={lang.name}
        >
          {lang.label}
        </motion.button>
      ))}
    </div>
  );
}
