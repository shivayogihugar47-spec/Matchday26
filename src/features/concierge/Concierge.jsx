import { useState, useEffect, useRef, memo } from 'react';
import { useMutation } from '@tanstack/react-query';
import TicketCard from '../../components/TicketCard';
import { useMatchDayStore } from '../../store/useMatchDayStore';
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

const ChatMessage = memo(({ msg }) => {
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isUser = msg.type === 'user';

  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-sky-500">
          <Bot className="h-3.5 w-3.5 text-white" />
        </div>
      )}
      <div className={`min-w-0 max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
        isUser
          ? 'rounded-tr-sm bg-sky-500/25 text-white ring-1 ring-sky-500/30'
          : 'rounded-tl-sm bg-slate-800/80 text-slate-100 ring-1 ring-white/8'
      }`}>
        {isUser ? (
          <p className="break-words">{msg.message}</p>
        ) : (
          <>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
              {msg.message}
            </ReactMarkdown>
            {msg.toolUsed === 'report_lost_item' && msg.toolResult?.reference && (
              <div className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Report Filed</span>
                </div>
                <div className="flex items-center gap-2">
                  <PackageSearch className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <span className="font-mono text-xs font-bold text-white">{msg.toolResult.reference}</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Head to the Lost & Found desk near AMEX Gate with this reference.</p>
              </div>
            )}
          </>
        )}
        <div className="mt-1 flex items-center gap-1 text-[10px] opacity-50">
          <MessageSquare className="h-2.5 w-2.5" />
          <span>{time}</span>
        </div>
      </div>
      {isUser && (
        <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600">
          <User className="h-3.5 w-3.5 text-white" />
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
        throw new Error('Unable to reach the concierge service.');
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || 'Failed to get AI response');
      }

      const data = await res.json().catch(() => { throw new Error('Invalid response.'); });
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
        { id: Date.now(), type: 'ai', message: `Sorry, something went wrong: ${error.message}`, timestamp: Date.now(), source: 'Error', model: 'N/A' },
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

  const statusText = isConnecting ? 'Connecting…' : assistantSpeaking ? 'Speaking' : userSpeaking ? 'Listening' : callActive ? 'Connected' : 'Tap mic to start voice';

  const VAPI_READY = !!import.meta.env.VITE_VAPI_PUBLIC_KEY && !!import.meta.env.VITE_VAPI_ASSISTANT_ID;

  return (
    <TicketCard className="overflow-hidden">
      {/* ── Header row ── */}
      <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-slate-900/50 px-4 py-3">
        {/* Bot avatar + status */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-sky-500">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-900 ${
              isConnecting ? 'bg-yellow-400 animate-pulse' : callActive ? 'bg-emerald-400' : 'bg-slate-500'
            }`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">MatchDay Concierge</p>
            <p className="truncate text-[11px] text-slate-400">
              {statusText}
              {callError && <span className="ml-1 text-rose-400">· {typeof callError === 'object' ? (callError.msg || 'Error') : callError}</span>}
              {micPermissionDenied && <span className="ml-1 text-amber-400">· Mic denied</span>}
            </p>
          </div>
        </div>

        {/* Voice button */}
        <button
          onClick={toggleCall}
          disabled={isConnecting || !VAPI_READY}
          className={`flex flex-shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
            isConnecting ? 'animate-pulse bg-gradient-to-r from-amber-400 to-orange-500' :
            callActive    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_16px_rgba(16,185,129,0.35)]' :
                            'bg-gradient-to-r from-amber-400 to-sky-500'
          }`}
        >
          {isConnecting
            ? <Activity className="h-4 w-4 animate-spin" />
            : callActive
            ? <><MicOff className="h-4 w-4" /><span className="hidden sm:inline">End</span></>
            : <><Mic className="h-4 w-4" /><span className="hidden sm:inline">Voice</span></>}
        </button>
      </div>

      {/* ── Active call waveform bar ── */}
      {callActive && (
        <div className="mb-4 flex items-center justify-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/8 px-4 py-2.5">
          <div className="flex h-5 items-end gap-1">
            {[
              { c: 'bg-amber-400',   h: assistantSpeaking ? 20 : userSpeaking ? 14 : 8 },
              { c: 'bg-sky-400',     h: assistantSpeaking ? 24 : userSpeaking ? 18 : 12 },
              { c: 'bg-emerald-400', h: assistantSpeaking ? 20 : userSpeaking ? 16 : 10 },
            ].map(({ c, h }, i) => (
              <div key={i} className={`w-1.5 rounded-full transition-all duration-200 ${c}`} style={{ height: h }} />
            ))}
          </div>
          <span className="text-xs font-medium text-emerald-300">
            {assistantSpeaking ? 'Speaking…' : userSpeaking ? 'Listening…' : 'Say something'}
          </span>
        </div>
      )}

      {/* ── Message list ── */}
      <div className="mb-3 flex h-64 flex-col gap-3 overflow-y-auto overscroll-contain rounded-2xl border border-white/8 bg-slate-950/40 p-3 sm:h-72">
        {conversation.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} />
        ))}

        {chatMutation.isPending && (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-sky-500">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-slate-800/80 px-3 py-2 ring-1 ring-white/8">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" style={{ animationDelay: '0.2s' }} />
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" style={{ animationDelay: '0.4s' }} />
              <span className="ml-1 text-xs text-slate-400">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input row ── */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={chatMutation.isPending}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900/70 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
          placeholder="Ask anything about the match or stadium…"
        />
        <button
          type="submit"
          disabled={!input.trim() || chatMutation.isPending}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-sky-500 px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </TicketCard>
  );
}
