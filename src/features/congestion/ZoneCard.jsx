import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ZoneCard({ zone, onReport }) {
  const getCongestionColor = (congestion) => {
    if (congestion < 0.4) return 'text-green-400';
    if (congestion < 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const getCongestionBg = (congestion) => {
    if (congestion < 0.4) return 'from-green-500/20 to-green-600/20';
    if (congestion < 0.7) return 'from-yellow-500/20 to-yellow-600/20';
    return 'from-red-500/20 to-red-600/20';
  };
  
  return (
    <div className={`rounded-[1.4rem] border border-white/10 bg-gradient-to-br ${getCongestionBg(zone.congestion)} p-4 shadow-md transition-all hover:shadow-lg`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <h4 className="font-display text-lg font-bold text-white">{zone.name}</h4>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
          zone.recommended ? 'bg-green-500/30 text-green-300' : 'bg-neutral-500/30 text-neutral-300'
        }`}>
          {zone.recommended ? 'Recommended' : 'Avoid'}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Wait time</span>
          <span className="font-mono text-xl font-bold text-white">{zone.waitTime} min</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Congestion</span>
          <span className={`font-mono text-xl font-bold ${getCongestionColor(zone.congestion)}`}>
            {Math.round(zone.congestion * 100)}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Reports</span>
          <span className="font-mono text-xl font-bold text-white">{zone.reportCount}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onReport('crowded')}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-500/20 py-2 text-xs font-semibold text-red-300 transition-all hover:bg-red-500/30"
        >
          <AlertCircle className="h-3.5 w-3.5" />
          Crowded
        </button>
        <button
          onClick={() => onReport('clear')}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-500/20 py-2 text-xs font-semibold text-green-300 transition-all hover:bg-green-500/30"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>
    </div>
  );
}
