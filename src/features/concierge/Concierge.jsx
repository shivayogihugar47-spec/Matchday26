import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import TicketCard from '../../components/TicketCard';
import { useMatchDayStore } from '../../store/useMatchDayStore';
import { AnimatePresence, motion } from 'framer-motion';
import { useVoiceConcierge } from '../../hooks/useVoiceConcierge';
import { Bot, Mic, MicOff, User, Send, Activity, MessageSquare, PackageSearch, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const INITIAL_CONVERSATION = [
  {
    id: 1,
    type: 'ai',
    message: 'Hey there! Welcome to MatchDay 26! I\'m your personal concierge for the FIFA World Cup 2026. Need info about the game, exit plans, lost & found, or anything else? Just ask!',
    timestamp: new Date().getTime(),
    model: 'fallback'
  }
];

export default function Concierge() {
  const { phase, language, accessibilityMode } = useMatchDayStore();
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState(INITIAL_CONVERSATION);
  const messagesEndRef = useRef(null);

  const {
    isConnecting,
    callActive,
    assistantSpeaking,
    userSpeaking,
    micPermissionDenied,
    callError,
    toggleCall
  } = useVoiceConcierge();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  const chatMutation = useMutation({
    mutationFn: async ({ message }) => {
      let res;
      try {
        // Build history from current conversation (exclude the initial welcome message)
        const history = conversation
          .filter((m) => m.id !== 1) // skip the static welcome message
          .map((m) => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.message,
            ...(m.reasoning_details ? { reasoning_details: m.reasoning_details } : {}),
          }));

        res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            history,
            phase,
            language,
            accessibility: accessibilityMode,
          }),
        });
      } catch {
        throw new Error('Unable to reach the concierge service. Make sure the backend is running on port 3001.');
      }

      if (!res.ok) {
        try {
          const errData = await res.json();
          throw new Error(errData.error || errData.details || 'Failed to get AI response');
        } catch (error) {
          if (error instanceof Error) throw new Error(error.message);
          throw new Error('Failed to get AI response');
        }
      }

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('The concierge service returned an invalid response.');
      }

      return data.data;
    },
    onSuccess: (data) => {
      setConversation(prev => [
        ...prev,
        {
          id: Date.now(),
          type: 'ai',
          message: data.message,
          timestamp: Date.now(),
          source: data.source,
          model: data.model,
          reasoning_details: data.reasoning_details ?? null,
          toolUsed: data.toolUsed ?? null,
          toolResult: data.toolResult ?? null,
        },
      ]);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setConversation(prev => [
        ...prev,
        {
          id: Date.now(),
          type: 'ai',
          message: `Oops! Sorry, there was an error: ${error.message}`,
          timestamp: Date.now(),
          source: 'Error',
          model: 'N/A'
        }
      ]);
    }
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMsg = { id: Date.now(), type: 'user', message: input, timestamp: Date.now() };
    setConversation(prev => [...prev, userMsg]);
    const messageToSend = input;
    setInput('');
    chatMutation.mutate({ message: messageToSend });
  };

  const getStatusText = () => {
    if (isConnecting) return 'Connecting';
    if (assistantSpeaking) return 'Speaking';
    if (userSpeaking) return 'Listening';
    if (callActive) return 'Connected';
    return 'Voice disconnected';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TicketCard className="relative overflow-hidden">
      <div className="relative z-10">
        <div className="mb-4 overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/60 p-3 shadow-[0_10px_30px_rgba(2,6,23,0.2)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.03 }}
                  className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-gradient-to-br from-amber-400 to-sky-500 shadow-[0_10px_25px_rgba(56,189,248,0.16)]"
                >
                  <Bot className="h-6 w-6 text-white" />
                </motion.div>
                <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-slate-900 ${
                  isConnecting ? 'bg-yellow-500 animate-pulse' :
                  callActive ? 'bg-emerald-500' :
                  'bg-slate-500'
                }`} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  MatchDay Concierge
                </h3>
                <p className="mt-1 flex items-center gap-2 text-[11px] text-slate-300">
                  <span className={`inline-block h-2 w-2 rounded-full ${
                    isConnecting ? 'bg-yellow-500 animate-pulse' :
                    callActive ? 'bg-emerald-500' :
                    'bg-slate-500'
                  }`} />
                  {getStatusText()}
                  {callError && <span className="ml-1 font-semibold text-rose-400">({typeof callError === 'object' ? (callError.msg || callError.details || 'Voice error') : callError})</span>}
                  {micPermissionDenied && <span className="ml-1 font-semibold text-amber-400">Mic denied</span>}
                </p>
              </div>
            </div>
            <button
              onClick={toggleCall}
              disabled={isConnecting || !import.meta.env.VITE_VAPI_PUBLIC_KEY || !import.meta.env.VITE_VAPI_ASSISTANT_ID}
              className={`flex h-11 w-11 items-center justify-center rounded-[1rem] shadow-[0_10px_25px_rgba(2,6,23,0.22)] ${
                isConnecting ? 'bg-gradient-to-br from-amber-500 to-yellow-600 animate-pulse' :
                callActive ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                'bg-gradient-to-br from-amber-400 to-sky-500'
              } ${(!import.meta.env.VITE_VAPI_PUBLIC_KEY || !import.meta.env.VITE_VAPI_ASSISTANT_ID) ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {isConnecting ? <Activity className="h-5 w-5 text-white animate-spin" /> : 
               callActive ? <MicOff className="h-5 w-5 text-white" /> : 
               <Mic className="h-5 w-5 text-white" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {callActive && (
            <div className="mb-4 flex items-center justify-center gap-3 rounded-[1.25rem] border border-emerald-400/20 bg-emerald-500/10 p-3">
              <div className="flex h-6 items-end gap-1.5">
                <div className="w-2 rounded-full bg-amber-400" style={{ height: assistantSpeaking ? '24px' : (userSpeaking ? '18px' : '10px') }} />
                <div className="w-2 rounded-full bg-sky-400" style={{ height: assistantSpeaking ? '30px' : (userSpeaking ? '22px' : '16px') }} />
                <div className="w-2 rounded-full bg-emerald-400" style={{ height: assistantSpeaking ? '26px' : (userSpeaking ? '20px' : '14px') }} />
              </div>
              <p className="text-xs font-semibold text-white">
                {assistantSpeaking ? 'Assistant is speaking' : userSpeaking ? 'Listening to you' : 'Tap mic to talk'}
              </p>
            </div>
          )}
        </AnimatePresence>

        <div className="mb-4 h-[280px] overflow-y-auto space-y-3 rounded-[1.6rem] border border-white/10 bg-slate-950/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <AnimatePresence initial={false}>
            {conversation.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type === 'ai' && (
                  <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[0.9rem] bg-gradient-to-br from-amber-400 to-sky-500">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-[1rem] p-3 ${
                    msg.type === 'user'
                      ? 'rounded-tr-none bg-gradient-to-br from-sky-500/35 to-sky-600/25 text-white shadow-[0_10px_24px_rgba(56,189,248,0.12)]'
                      : 'rounded-tl-none border border-white/10 bg-slate-900/75 text-white shadow-[0_10px_24px_rgba(2,6,23,0.2)]'
                  }`}
                >
                  <div className="text-sm leading-relaxed">
                    {msg.type === 'ai' ? (
                      <>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            ul: ({ ...props }) => (
                              <ul className="ml-0 mb-2 list-disc list-inside text-slate-200" {...props} />
                            ),
                            ol: ({ ...props }) => (
                              <ol className="ml-0 mb-2 list-decimal list-inside text-slate-200" {...props} />
                            ),
                            li: ({ ...props }) => (
                              <li className="mb-1" {...props} />
                            ),
                            p: ({ ...props }) => (
                              <p className="mb-2 last:mb-0" {...props} />
                            ),
                            strong: ({ ...props }) => (
                              <strong className="font-bold text-white" {...props} />
                            ),
                            a: ({ ...props }) => (
                              <a className="text-cyan-300 underline transition hover:text-cyan-200" target="_blank" rel="noopener noreferrer" {...props} />
                            ),
                            code: ({ inline, ...props }) => (
                              inline ? (
                                <code className="rounded bg-slate-900/80 px-1.5 py-0.5 font-mono text-xs text-amber-300" {...props} />
                              ) : (
                                <pre className="mb-2 overflow-x-auto rounded-lg border border-white/10 bg-slate-900/80 p-2 font-mono text-xs" {...props} />
                              )
                            )
                          }}
                        >
                          {msg.message}
                        </ReactMarkdown>

                        {/* Lost & Found confirmation card */}
                        {msg.toolUsed === 'report_lost_item' && msg.toolResult?.reference && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3"
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Report Filed</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <PackageSearch className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                              <span className="font-mono text-xs font-bold text-white">{msg.toolResult.reference}</span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-400">Head to the Lost & Found desk near AMEX Gate with this reference.</p>
                          </motion.div>
                        )}
                      </>
                    ) : (
                      <p>{msg.message}</p>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] opacity-75">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-2.5 w-2.5" />
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
                {msg.type === 'user' && (
                  <div className="ml-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[0.9rem] bg-gradient-to-br from-sky-500 to-cyan-600">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex items-start">
                <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[0.9rem] bg-gradient-to-br from-amber-400 to-sky-500">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-2 rounded-[1rem] rounded-tl-none border border-white/10 bg-slate-900/75 p-3">
                  <div className="flex h-5 items-end gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <div className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" style={{ animationDelay: '0.15s' }} />
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
                  </div>
                  <span className="text-xs font-semibold text-neutral-300">
                    Thinking...
                  </span>
                </div>
              </div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-2" />
        </div>

        <form onSubmit={handleSend} className="flex gap-2 rounded-[1.6rem] border border-white/10 bg-slate-950/55 p-2 shadow-[0_10px_25px_rgba(2,6,23,0.18)]">
          <div className="flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={chatMutation.isPending}
              className="w-full rounded-[1rem] border border-white/10 bg-slate-900/70 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20 disabled:opacity-50"
              placeholder="Ask me anything about the match or stadium..."
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || chatMutation.isPending}
            className="flex items-center gap-1.5 rounded-[1rem] bg-gradient-to-br from-amber-400 to-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(56,189,248,0.16)] disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            Send
          </button>
        </form>
      </div>
    </TicketCard>
  );
}
