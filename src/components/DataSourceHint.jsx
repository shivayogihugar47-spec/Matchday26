import { useState } from 'react';
import { Info } from 'lucide-react';

export default function DataSourceHint({ label, description, className = '' }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        aria-label={`About ${label}`}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-all duration-200 hover:border-sky-400/30 hover:bg-sky-500/10 hover:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(event) => {
          event.preventDefault();
          setOpen((value) => !value);
        }}
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950/95 px-3 py-2 text-[11px] leading-5 text-slate-300 shadow-[0_20px_45px_rgba(2,6,23,0.35)] backdrop-blur">
          <p className="font-semibold text-white">{label}</p>
          <p className="mt-1 text-slate-400">{description}</p>
        </div>
      )}
    </div>
  );
}
