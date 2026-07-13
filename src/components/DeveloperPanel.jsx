import TicketCard from './TicketCard';
import { useMatchDayStore } from '../store/useMatchDayStore';
import { useMatchStatus } from '../hooks/useMatchStatus';
import { Settings } from 'lucide-react';

export default function DeveloperPanel() {
  const { phase, setPhase, accessibilityMode, language, voiceStatus, developerPanelOpen } = useMatchDayStore();
  const { data: match } = useMatchStatus();
  
  if (!developerPanelOpen) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <TicketCard className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-gradient-to-br from-pink-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Settings className="w-4.5 h-4.5 text-white" />
          </div>
          <h3 className="font-display text-lg font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
            Developer Panel
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-neutral-400 font-semibold mb-3 uppercase tracking-wider text-xs">Current phase</p>
            <div className="flex flex-wrap gap-2">
              {['PRE_MATCH', 'LIVE_MATCH', 'POST_MATCH'].map((p) => (
                <button
                  key={`phase-btn-${p}`}
                  onClick={() => setPhase(p)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    phase === p 
                      ? 'bg-gradient-to-r from-pink-500 to-blue-600 text-white shadow-md border-transparent' 
                      : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-neutral-400 font-semibold text-xs uppercase tracking-wider mb-1.5">Accessibility</p>
              <p className="font-mono text-base font-bold text-white">{accessibilityMode ? 'ON' : 'OFF'}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-neutral-400 font-semibold text-xs uppercase tracking-wider mb-1.5">Language</p>
              <p className="font-mono text-base font-bold text-white">{language}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-neutral-400 font-semibold text-xs uppercase tracking-wider mb-1.5">Voice status</p>
              <p className="font-mono text-base font-bold text-yellow-400">{voiceStatus}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-neutral-400 font-semibold text-xs uppercase tracking-wider mb-1.5">Data source</p>
              <p className="font-mono text-base font-bold text-green-400">{match?.sourceLabel || 'Reference data'}</p>
            </div>
          </div>
        </div>
      </TicketCard>
    </div>
  );
}
