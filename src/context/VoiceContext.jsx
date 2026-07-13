/**
 * VoiceContext — single Vapi instance shared across AppHeader + Concierge.
 * Previously both called useVoiceConcierge() independently, creating two
 * separate Vapi connections and duplicated state.
 */
import { createContext, useContext } from 'react';
import { useVoiceConcierge } from '../hooks/useVoiceConcierge';

const VoiceContext = createContext(null);

export function VoiceProvider({ children }) {
  const voice = useVoiceConcierge();
  return <VoiceContext.Provider value={voice}>{children}</VoiceContext.Provider>;
}

export function useVoice() {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error('useVoice must be used inside <VoiceProvider>');
  return ctx;
}
