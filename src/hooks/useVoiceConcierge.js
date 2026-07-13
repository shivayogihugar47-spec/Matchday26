import { useState, useRef, useEffect, useCallback } from 'react';
import { useMatchDayStore } from '../store/useMatchDayStore';

// Vapi loaded lazily on first toggleCall — not on page load
// This keeps the 298KB vendor-vapi chunk out of the critical path
let VapiClass = null;
async function getVapi() {
  if (VapiClass) return VapiClass;
  const mod = await import('@vapi-ai/web');
  VapiClass = mod.default?.default || mod.default || mod;
  return VapiClass;
}

export const useVoiceConcierge = () => {
  // Get app state from store
  const { accessibilityMode, setVoiceStatus, voiceStatus, selectedGate } = useMatchDayStore();
  
  // Local state
  const [isConnecting, setIsConnecting] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [assistantSpeaking, setAssistantSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [callError, setCallError] = useState(null);
  
  // Refs
  const vapiRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const callActiveRef = useRef(false); // Track callActive with a ref to avoid dependency issues
  
  // Cleanup function
  const cleanupVapi = useCallback(() => {
    if (vapiRef.current) {
      try {
        vapiRef.current.stop().catch(() => {});
        vapiRef.current.removeAllListeners();
      } catch (e) {
        console.log('Cleanup error (expected):', e);
      }
    }
    setCallActive(false);
    callActiveRef.current = false;
    setAssistantSpeaking(false);
    setUserSpeaking(false);
    setIsConnecting(false);
    setVoiceStatus('disconnected');
  }, [setVoiceStatus]);

  // Initialize Vapi lazily — called only on first toggleCall, not on mount
  const initVapi = useCallback(async () => {
    if (vapiRef.current) return; // already initialized
    try {
      if (!import.meta.env.VITE_VAPI_PUBLIC_KEY) return;
      const Vapi = await getVapi();
      vapiRef.current = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY);

      vapiRef.current.on('call-start', () => {
        setIsConnecting(false);
        setCallActive(true);
        callActiveRef.current = true;
        setCallError(null);
        setVoiceStatus('connected');
      });

      vapiRef.current.on('speech-start', () => {
        setAssistantSpeaking(true);
        setVoiceStatus('speaking');
      });

      vapiRef.current.on('speech-end', () => {
        setAssistantSpeaking(false);
        if (callActiveRef.current) setVoiceStatus('connected');
      });

      vapiRef.current.on('message', (message) => {
        if (message.type === 'status-update' && message.status === 'listening') {
          setUserSpeaking(true);
          setVoiceStatus('listening');
        } else if (message.type === 'status-update' && message.status === 'thinking') {
          setUserSpeaking(false);
        }
      });

      vapiRef.current.on('call-end', () => cleanupVapi());

      vapiRef.current.on('error', (error) => {
        const msg =
          error?.error?.msg || error?.error?.message || error?.error?.details ||
          error?.message || (typeof error?.error === 'string' ? error.error : null) ||
          'Voice call ended unexpectedly';
        setCallError(String(msg));
        cleanupVapi();
      });

      vapiRef.current.on('call-start-failed', (failed) => {
        const msg =
          failed?.error?.msg || failed?.error?.message || failed?.error?.details ||
          failed?.message || 'Call failed to start';
        setCallError(String(msg));
        cleanupVapi();
      });
    } catch (e) {
      console.error('[Vapi] Init failed:', e);
    }
  }, [cleanupVapi, setVoiceStatus]);

  // Toggle call handler with debounce
  const toggleCall = useCallback(async () => {
    if (debounceTimerRef.current) return;
    debounceTimerRef.current = setTimeout(() => { debounceTimerRef.current = null; }, 500);

    if (callActive || voiceStatus !== 'disconnected') {
      cleanupVapi();
    } else {
      try {
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: 'microphone' });
          if (permission.state === 'denied') {
            setMicPermissionDenied(true);
            setCallError('Microphone access denied. Please enable it in your browser settings.');
            return;
          }
        }

        setIsConnecting(true);
        setMicPermissionDenied(false);
        setCallError(null);

        // Init Vapi lazily on first use — 298KB loads only here
        await initVapi();

        const promptRes = await fetch(
          `/api/concierge/system-prompt?zone=${encodeURIComponent(selectedGate)}&accessibility=${accessibilityMode}&language=Auto-detect`
        );
        if (!promptRes.ok) throw new Error('Failed to fetch system prompt');

        const promptData = await promptRes.json();
        const { variableValues } = promptData.data;

        if (vapiRef.current && import.meta.env.VITE_VAPI_ASSISTANT_ID) {
          await vapiRef.current.start(import.meta.env.VITE_VAPI_ASSISTANT_ID, { variableValues });
        }
      } catch (err) {
        setCallError(err.message || 'Failed to start voice call');
        setIsConnecting(false);
        cleanupVapi();
      }
    }
  }, [callActive, voiceStatus, cleanupVapi, initVapi, accessibilityMode, selectedGate]);

  // Cleanup on unmount
  useEffect(() => () => cleanupVapi(), [cleanupVapi]);

  return {
    // State
    isConnecting,
    callActive,
    assistantSpeaking,
    userSpeaking,
    micPermissionDenied,
    callError,
    voiceStatus,
    // Actions
    toggleCall,
    cleanupVapi
  };
};
