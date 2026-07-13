import { useState, useEffect, useRef, memo } from 'react';
import { useMutation } from '@tanstack/react-query';
import TicketCard from '../../components/TicketCard';
import { useMatchDayStore } from '../../store/useMatchDayStore';
import { AnimatePresence, motion } from 'framer-motion';
import { useVoice } from '../../context/VoiceContext';
import { Bot, Mic, MicOff, User, Send, Activity, MessageSquare, PackageSearch, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const INITIAL_CONVERSATION = [
  {
    id: 1,
    type: 'ai',
    message: "Hey there! Welcome to MatchDay 26! I'm your personal concierge for the FIFA World Cup 2026. Need info about the game, exit plans, lost & found, or anything else? Just ask!",
    timestamp: Date.now(),
    model: 'fallback',
  },
];

// Stable markdown component map — defined once, never recreated on render
const MD_COMPONENTS = {
  ul:     (p) => <ul className="ml-0 mb-2 list-disc list-inside text-slate-200" {...p} />,
  ol:     (p) => <ol className="ml-0 mb-2 list-decimal list-inside text-slate-200" {...p} />,
  li:     (p) => <li className="mb-1" {...p} />,
  p:      (p) => <p className="mb-2 last:mb-0" {...p} />,
  strong: (p) => <strong className="font-bold text-white" {...p} />,
  a:      (p) => <a className="text-cyan-300 underline hover:text-cyan-200" target="_blank" rel="noopener noreferrer" {...p} />,
  code: ({ inline, ...p }) =>
    inline
      ? <code className="rounded bg-slate-900/80 px-1.5 py-0.5 font-mono text-xs text-amber-300" {...p} />
      : <pre className="mb-2 overflow-x-auto rounded-lg border border-white/10 bg-slate-900/80 p-2 font-mono text-xs" {...p} />,
};

// Memoized message bubble — only re-renders if its own msg prop changes
const ChatMessage = memo(({ msg }) => {
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isUser = msg.type === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[0.9rem] bg-gradient-to-br from-amber-400 to-sky-500">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      <div className={`max-w-[85%] rounded-[1rem] p-3 ${
        isUser
          ? 'rounded-tr-none bg-gradient-to-br from-sky-500/35 to-sky-600/25 text-white'
          : 'rounded-tl-none border border-white/10 bg-slate-900/75 text-white'
      }`}>
        <div className="text-sm leading-relaxed">
          {isUser ? (
            <p>{msg.message}</p>
          ) : (
            <>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
                {msg.message}
              </ReactMarkdown>
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
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-1 text-[10px] opacity-60">
          <MessageSquare className="h-2.5 w-2.5" />
          <span>{time}</span>
        </div>
      </div>
      {isUser && (
        <div className="ml-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[0.9rem] bg-gradient-to-br from-sky-500 to-cyan-600">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
});
ChatMessage.displayName = 'ChatMessage';

export default function Concierge() {
  const { phase, language, accessibilityMode } = useMatchDayStore();
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState(INITIAL_CONVERSATION);
  const messagesEndRef = useRef(null);

  const { isConnecting, callActive, assistantSpeaking, userSpeaking, micPermissionDenied, callError, toggleCall } = useVoice();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const chatMutation = useMutation({
    mutationFn: async ({ message }) => {
      const history = conversation
        .filter((m) => m.id !== 1)
        .map((m) => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.message,
          ...(m.reasoning_details ? { reasoning_details: m.reasoning_details } : {}),
        }));

      let res;
      try {
        res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, history, phase, language, accessibility: accessibilityMode }),
        });
      } catch {
        throw new Error('Unable to reach the concierge service. Make sure the backend is running.');
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || 'Failed to get AI response');
      }

      const data = await res.json().catch(() => { throw new Error('Invalid response from server.'); });
      return data.data;
    },
    onSuccess: (data) => {
      setConversation((prev) => [
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
      setConversation((prev) => [
        ...prev,
        { id: Date.now(), type: 'ai', message: `Sorry, there was an error: ${error.message}`, timestamp: Date.now(), source: 'Error', model: 'N/A' },
      ]);
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;
    const msg = input.trim();
    setConversation((prev) => [...prev, { id: Date.now(), type: 'user', message: msg, timestamp: Date.now() }]);
    setInput('');
    chatMutation.mutate({ message: msg });
  };

  const statusText = isConnecting ? 'Connecting' : assistantSpeaking ? 'Speaking' : userSpeaking ? 'Listening' : callActive ? 'Connected' : 'Voice off';

  return (
    <TicketCard className="relative overflow-hidden">
      <div className="relative z-10">
        {/* Voice header */}
        <div className="mb-4 overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/60 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.03 }}
                  className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-gradient-to-br from-amber-400 to-sky-500"
                >
                  <Bot className="h-6 w-6 text-white" />
                </motion.div>
                <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-slate-900 ${
                  isConnecting ? 'bg-yellow-500 animate-pulse' : callActive ? 'bg-emerald-500' : 'bg-slate-500'
                }`} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">MatchDay Concierge</h3>
                <p className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-300">
                  <span className={`inline-block h-2 w-2 rounded-full ${isConnecting ? 'bg-yellow-500 animate-pulse' : callActive ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                  {statusText}
                  {callError && <span className="text-rose-400">({typeof callError === 'object' ? (callError.msg || 'Voice error') : callError})</span>}
                  {micPermissionDenied && <span className="text-amber-400">Mic denied</span>}
                </p>
              </div>
            </div>
            <button
              onClick={toggleCall}
              disabled={isConnecting || !import.meta.env.VITE_VAPI_PUBLIC_KEY || !import.meta.env.VITE_VAPI_ASSISTANT_ID}
              className={`flex h-11 w-11 items-center justify-center rounded-[1rem] ${
                isConnecting ? 'animate-pulse bg-gradient-to-br from-amber-500 to-yellow-600' :
                callActive    ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                                'bg-gradient-to-br from-amber-400 to-sky-500'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {isConnecting ? <Activity className="h-5 w-5 animate-spin text-white" /> :
               callActive    ? <MicOff   className="h-5 w-5 text-white" /> :
                               <Mic      className="h-5 w-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Active call waveform */}
        <AnimatePresence>
          {callActive && (
            <div className="mb-4 flex items-center justify-center gap-3 rounded-[1.25rem] border border-emerald-400/20 bg-emerald-500/10 p-3">
              <div className="flex h-6 items-end gap-1.5">
                {[
                  { color: 'bg-amber-400',  h: assistantSpeaking ? '24px' : userSpeaking ? '18px' : '10px' },
                  { color: 'bg-sky-400',    h: assistantSpeaking ? '30px' : userSpeaking ? '22px' : '16px' },
                  { color: 'bg-emerald-400',h: assistantSpeaking ? '26px' : userSpeaking ? '20px' : '14px' },
                ].map(({ color, h }, i) => (
                  <div key={i} className={`w-2 rounded-full transition-all duration-150 ${color}`} style={{ height: h }} />
                ))}
              </div>
              <p className="text-xs font-semibold text-white">
                {assistantSpeaking ? 'Assistant is speaking' : userSpeaking ? 'Listening to you' : 'Tap mic to talk'}
              </p>
            </div>
          )}
        </AnimatePresence>

        {/* Message list */}
        <div className="mb-4 h-[280px] overflow-y-auto space-y-3 rounded-[1.6rem] border border-white/10 bg-slate-950/45 p-4">
          {conversation.map((msg) => (
            <ChatMessage key={msg.id} msg={msg} />
          ))}
          {chatMutation.isPending && (
            <div className="flex items-start">
              <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[0.9rem] bg-gradient-to-br from-amber-400 to-sky-500">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-center gap-2 rounded-[1rem] rounded-tl-none border border-white/10 bg-slate-900/75 p-3">
                <div className="flex h-5 items-end gap-1.5">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" style={{ animationDelay: '0.15s' }} />
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" style={{ animationDelay: '0.3s' }} />
                </div>
                <span className="text-xs font-semibold text-neutral-300">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-2 rounded-[1.6rem] border border-white/10 bg-slate-950/55 p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={chatMutation.isPending}
            className="flex-1 rounded-[1rem] border border-white/10 bg-slate-900/70 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20 disabled:opacity-50"
            placeholder="Ask me anything about the match or stadium…"
          />
          <button
            type="submit"
            disabled={!input.trim() || chatMutation.isPending}
            className="flex items-center gap-1.5 rounded-[1rem] bg-gradient-to-br from-amber-400 to-sky-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            Send
          </button>
        </form>
      </div>
    </TicketCard>
  );
}
