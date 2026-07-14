/**
 * VoiceContext — single Vapi instance shared across AppHeader + Concierge.
 * Previously both called useVoiceConcierge() independently, creating two
 * separate Vapi connections and duplicated state.
 *
 * Note: This file intentionally exports both a provider component (VoiceProvider)
 * and a consumer hook (useVoice). The react-refresh rule is suppressed on useVoice
 * because co-locating context provider + consumer hook is a standard React pattern.
 */
import { createContext, useContext } from 'react';
import { useVoiceConcierge } from '../hooks/useVoiceConcierge';

const VoiceContext = createContext(null);

export function VoiceProvider({ children }) {
  const voice = useVoiceConcierge();
  return <VoiceContext.Provider value={voice}>{children}</VoiceContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useVoice() {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error('useVoice must be used inside <VoiceProvider>');
  return ctx;
}
