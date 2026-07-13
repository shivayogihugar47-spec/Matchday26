import { useMatchDayStore } from '../store/useMatchDayStore';

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English'   },
  { code: 'es', label: 'ES', name: 'Español'   },
  { code: 'fr', label: 'FR', name: 'Français'  },
  { code: 'de', label: 'DE', name: 'Deutsch'   },
  { code: 'pt', label: 'PT', name: 'Português' },
  { code: 'hi', label: 'HI', name: 'हिन्दी'    },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useMatchDayStore();

  return (
    <div className="flex gap-1.5">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          title={lang.name}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold transition-all duration-150 active:scale-95 ${
            language === lang.code
              ? 'border-white/40 bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md'
              : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
