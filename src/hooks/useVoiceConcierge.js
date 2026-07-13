import { useState, useRef, useEffect, useCallback } from 'react';
import { useMatchDayStore } from '../store/useMatchDayStore';
import VapiImport from '@vapi-ai/web';

// Fix Vapi import
const Vapi = VapiImport.default?.default || VapiImport.default || VapiImport;

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

  // Initialize Vapi on mount
  useEffect(() => {
    const initVapi = () => {
      try {
        if (import.meta.env.VITE_VAPI_PUBLIC_KEY) {
          vapiRef.current = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY);
          
          // Set up event listeners
          if (vapiRef.current) {
            // Call start event
            vapiRef.current.on('call-start', () => {
              console.log('[Vapi] Call started');
              setIsConnecting(false);
              setCallActive(true);
              callActiveRef.current = true;
              setCallError(null);
              setVoiceStatus('connected');
            });

            // Assistant speaking events
            vapiRef.current.on('speech-start', () => {
              console.log('[Vapi] Assistant speaking');
              setAssistantSpeaking(true);
              setVoiceStatus('speaking');
            });

            vapiRef.current.on('speech-end', () => {
              console.log('[Vapi] Assistant stopped speaking');
              setAssistantSpeaking(false);
              if (callActiveRef.current) setVoiceStatus('connected');
            });

            // User listening - Listen to message events instead of 'listening' which isn't emitted
            vapiRef.current.on('message', (message) => {
              if (message.type === 'status-update' && message.status === 'listening') {
                console.log('[Vapi] Listening for user');
                setUserSpeaking(true);
                setVoiceStatus('listening');
              } else if (message.type === 'status-update' && message.status === 'thinking') {
                setUserSpeaking(false);
              }
            });

            // Call end event
            vapiRef.current.on('call-end', () => {
              console.log('[Vapi] Call ended');
              cleanupVapi();
            });

            // Error handling
            vapiRef.current.on('error', (error) => {
              console.error('[Vapi] Error:', error);
              setCallError(error.error?.message || error.message || 'Something went wrong');
              cleanupVapi();
            });

            // Call progress
            vapiRef.current.on('call-start-progress', (progress) => {
              console.log('[Vapi] Call progress:', progress);
            });

            vapiRef.current.on('call-start-failed', (failed) => {
              console.error('[Vapi] Call failed:', failed);
              setCallError(failed.error?.message || 'Call failed');
              cleanupVapi();
            });
          }
        }
      } catch (e) {
        console.error('[Vapi] Init failed:', e);
      }
    };

    initVapi();

    // Cleanup on unmount
    return () => {
      cleanupVapi();
    };
  }, [cleanupVapi, setVoiceStatus]); // Removed callActive from dependencies to prevent infinite loop

  // Toggle call handler with debounce
  const toggleCall = useCallback(async () => {
    // Prevent rapid double-taps
    if (debounceTimerRef.current) return;
    
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
    }, 500);

    if (callActive || voiceStatus !== 'disconnected') {
      // End current call
      cleanupVapi();
    } else {
      // Check microphone permissions first
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
        
        // Step 1: Fetch system prompt and variable values from backend
        console.log('[Vapi] Fetching system prompt from backend...');
        
        // For voice, we'll let Vapi auto-detect the language, but still pass UI language as fallback
        const promptRes = await fetch(
          `/api/concierge/system-prompt?zone=${encodeURIComponent(selectedGate)}&accessibility=${accessibilityMode}&language=Auto-detect`
        );

        if (!promptRes.ok) throw new Error('Failed to fetch system prompt');
        
        const promptData = await promptRes.json();
        const { variableValues } = promptData.data;
        
        console.log('[Vapi] Starting call with variable values:', variableValues);
        
        // Step 2: Start Vapi call
        if (vapiRef.current && import.meta.env.VITE_VAPI_ASSISTANT_ID) {
          await vapiRef.current.start(
            import.meta.env.VITE_VAPI_ASSISTANT_ID,
            {
              variableValues
            }
          );
        }
      } catch (err) {
        console.error('[Vapi] Toggle error:', err);
        setCallError(err.message || 'Failed to start voice call');
        setIsConnecting(false);
        cleanupVapi();
      }
    }
  }, [
    callActive,
    voiceStatus,
    cleanupVapi,
    accessibilityMode,
    selectedGate
  ]);

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
