import { useState, useEffect, memo, useCallback } from 'react';
import TicketCard from '../../components/TicketCard';
import { useMatchStatus } from '../../hooks/useMatchStatus';
import { useMatchDayStore } from '../../store/useMatchDayStore';
import { Trophy, Clock, MapPin, XCircle, ThumbsUp } from 'lucide-react';

const FINAL_KICKOFF = new Date('2026-07-19T15:00:00-04:00');

function formatDateSafely(dateString, options = {}) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', options);
  } catch { return ''; }
}

function formatTimeSafely(dateString, options = {}) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString('en-US', options);
  } catch { return ''; }
}

// Isolated countdown — only this re-renders every second
const Countdown = memo(({ isPreMatch }) => {
  const [cd, setCd] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = FINAL_KICKOFF - Date.now();
      if (diff <= 0) { setCd({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setCd({
        days:    Math.floor(diff / 86_400_000),
        hours:   Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000)  / 60_000),
        seconds: Math.floor((diff % 60_000)      / 1_000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[['Days', cd.days], ['Hours', cd.hours], ['Minutes', cd.minutes], ['Seconds', cd.seconds]].map(([label, value]) => (
        <div key={label} className={`rounded-[1.25rem] border border-white/10 p-3 text-center ${isPreMatch ? 'bg-slate-950/80' : 'bg-slate-950/70'}`}>
          <div className={`font-display text-2xl font-bold sm:text-3xl ${isPreMatch ? 'text-amber-50' : 'text-white'}`}>
            {String(value).padStart(2, '0')}
          </div>
          <div className={`mt-1 text-[10px] font-semibold uppercase tracking-[0.3em] ${isPreMatch ? 'text-amber-200/80' : 'text-slate-400'}`}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
});
Countdown.displayName = 'Countdown';

export default function MatchCard() {
  const { data: match, isLoading, isError } = useMatchStatus();
  const { phase } = useMatchDayStore();
  const [userVote, setUserVote] = useState(null);

  const handleVote = useCallback((team) => {
    if (userVote) return;
    setUserVote(team);
  }, [userVote]);

  const matchStatus = (match?.status || '').toString().toUpperCase();
  const isMatchActive = ['IN_PLAY', 'PAUSED', 'HALFTIME', 'BREAK'].includes(matchStatus);
  const isMatchComplete = ['FINISHED', 'AWARDED'].includes(matchStatus);
  const hasLiveScore = isMatchActive && match?.score;
  const isPreMatch = phase === 'PRE_MATCH' && !hasLiveScore && !isMatchComplete;
  const isLiveMatch = hasLiveScore;
  const hideVoteControls = !isPreMatch;

  if (isLoading) {
    return (
      <TicketCard className="overflow-hidden">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-2xl" />
            <div className="space-y-2">
              <div className="h-6 w-40 bg-white/10 rounded-lg" />
              <div className="h-4 w-24 bg-white/10 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="space-y-2">
              <div className="h-8 w-full bg-white/10 rounded-lg" />
              <div className="h-3 w-16 bg-white/10 rounded-lg mx-auto" />
            </div>
            <div className="h-20 bg-white/10 rounded-2xl" />
            <div className="space-y-2">
              <div className="h-8 w-full bg-white/10 rounded-lg" />
              <div className="h-3 w-16 bg-white/10 rounded-lg mx-auto" />
            </div>
          </div>
        </div>
      </TicketCard>
    );
  }

  if (isError || !match) {
    return (
      <TicketCard className="overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-yellow-500 rounded-2xl flex items-center justify-center">
            <XCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-white mb-1">
              Match Status
            </h3>
            <p className="text-neutral-400 text-sm">
              Unable to load match data
            </p>
          </div>
        </div>
      </TicketCard>
    );
  }

  // Determine display text for teams
  const homeTeamDisplay = match.homeTeam === 'Finalists to be determined' ? 'TBD' : match.homeTeam;
  const awayTeamDisplay = match.awayTeam === 'Finalists to be determined' ? 'TBD' : match.awayTeam;

  return (
    <TicketCard className="relative overflow-hidden">
      <div className="relative z-10">
        <div className="mb-5 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/60 px-4 py-4 shadow-[0_10px_35px_rgba(2,6,23,0.25)] sm:flex-row sm:items-center sm:justify-center">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-center sm:text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 shadow-[0_10px_25px_rgba(251,191,36,0.2)]">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-amber-300">FIFA World Cup 2026 Final</p>
              <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
                Spain vs Argentina
              </h3>
            </div>
          </div>
          <div className={`mx-auto mt-3 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] sm:mt-0 ${isMatchActive ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300' : isMatchComplete ? 'border-slate-400/20 bg-slate-800/50 text-slate-300' : 'border-amber-400/25 bg-amber-500/10 text-amber-200'}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${isMatchActive ? 'animate-pulse bg-emerald-400' : isMatchComplete ? 'bg-slate-400' : 'bg-amber-400'}`} />
            {isMatchActive ? 'Match live' : isMatchComplete ? 'Match complete' : 'Kickoff pending'}
          </div>
        </div>

        <div className={`mb-5 rounded-[1.8rem] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${isPreMatch ? 'border-amber-400/20 bg-[linear-gradient(135deg,rgba(251,191,36,0.16),rgba(2,6,23,0.78))]' : 'border-white/10 bg-slate-900/60'}`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] ${isPreMatch ? 'text-amber-100' : 'text-slate-300'}`}>
              <Clock className={`h-4 w-4 ${isPreMatch ? 'text-amber-300' : 'text-amber-300'}`} />
              Final countdown
            </div>
            <div className={`rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] ${isPreMatch ? 'bg-slate-950/60 text-amber-100' : 'bg-slate-950/50 text-slate-300'}`}>
              {match.minute}'
            </div>
          </div>
          <Countdown isPreMatch={isPreMatch} />
        </div>

        {/* Headline */}
        <div className="mb-6 text-center">
          <h2 className="font-display text-2xl font-bold bg-gradient-to-r from-amber-300 via-yellow-200 to-sky-300 bg-clip-text text-transparent sm:text-3xl">
            🏆 FIFA World Cup 2026 Final
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Sunday, July 19 · 3:00 PM ET · MetLife Stadium, New Jersey
          </p>
          {/* Semifinal results */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">SF1: <span className="text-white font-semibold">Spain 2–0 France</span></span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">SF2: <span className="text-white font-semibold">TBD</span></span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <div className={`rounded-[1.8rem] border p-4 text-center transition-transform duration-200 hover:scale-[1.01] ${isPreMatch ? 'border-amber-400/20 bg-[linear-gradient(135deg,rgba(251,191,36,0.18),rgba(2,6,23,0.84))]' : 'border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.94),rgba(2,6,23,0.82))] opacity-90'}`}>
            <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/25 bg-gradient-to-br from-amber-300/20 to-orange-500/10">
              <span className="font-display text-3xl font-bold text-amber-100">
                {homeTeamDisplay.split(' ').map(word => word[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="rounded-full border border-white/10 bg-slate-950/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-100/90">
                Match sheet
              </span>
              <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">
                Home
              </span>
            </div>
            <p className="font-display text-lg font-semibold uppercase text-white">{homeTeamDisplay}</p>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-200/80">World Champions · 2010</p>
            {!hideVoteControls && (
              <div className="mt-2 flex flex-col items-center gap-2">
                <button
                  onClick={() => handleVote('home')}
                  disabled={Boolean(userVote && userVote !== 'home')}
                  className={`inline-flex items-center justify-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                    userVote === 'home'
                      ? 'border-amber-400/50 bg-amber-400 text-amber-950 shadow-[0_8px_20px_rgba(251,191,36,0.18)]'
                      : 'border-white/10 bg-white/8 text-white hover:bg-white/15'
                  }`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>{userVote === 'home' ? 'Voted ✓' : 'Fan Pick'}</span>
                </button>
                <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400">
                  {userVote ? 'Your pick is locked in.' : 'Who lifts the trophy?'}
                </p>
              </div>
            )}
          </div>

          <div className={`rounded-[2.2rem] border px-5 py-4 transition-transform duration-200 hover:scale-[1.01] ${isLiveMatch ? 'border-amber-400/20 bg-[linear-gradient(135deg,rgba(251,191,36,0.16),rgba(15,23,42,0.95))]' : 'border-white/10 bg-[linear-gradient(135deg,rgba(2,6,23,0.96),rgba(15,23,42,0.9))] opacity-90'}`}>
            <div className="flex flex-col items-center gap-3">
              <div className={`rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] ${isLiveMatch ? 'text-amber-100' : 'text-slate-300'}`}>
                {hasLiveScore ? 'Live score' : 'Scheduled kickoff'}
              </div>
              {hasLiveScore ? (
                <div className="flex items-center justify-center gap-4">
                  <span className="font-mono text-5xl font-bold text-amber-200">{match.score.home}</span>
                  <div className="flex flex-col gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  </div>
                  <span className="font-mono text-5xl font-bold text-sky-200">{match.score.away}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="font-display text-2xl font-semibold text-white">
                    {formatDateSafely(match.kickoff, { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="font-mono text-4xl font-semibold text-amber-100">
                    {formatTimeSafely(match.kickoff, { hour: 'numeric', minute: '2-digit' })}
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                    {match.status || 'Scheduled'}
                  </div>
                </div>
              )}
              <div className={`rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] ${isLiveMatch ? 'text-amber-100/80' : 'text-slate-400'}`}>
                {hasLiveScore ? 'Broadcast overlay' : 'Kickoff window'}
              </div>
            </div>
          </div>

          <div className={`rounded-[1.8rem] border p-4 text-center transition-transform duration-200 hover:scale-[1.01] ${isPreMatch ? 'border-sky-400/20 bg-[linear-gradient(135deg,rgba(56,189,248,0.12),rgba(2,6,23,0.84))] opacity-90' : 'border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(2,6,23,0.82))] opacity-85'}`}>
            <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border border-sky-400/25 bg-gradient-to-br from-sky-300/20 to-blue-500/10">
              <span className="font-display text-3xl font-bold text-sky-100">
                {awayTeamDisplay.split(' ').map(word => word[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="rounded-full border border-white/10 bg-slate-950/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-100/90">
                Match sheet
              </span>
              <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">
                Away
              </span>
            </div>
            <p className="font-display text-lg font-semibold uppercase text-white">{awayTeamDisplay}</p>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-200/80">SF2 Winner · July 15</p>
            {!hideVoteControls && (
              <div className="mt-2 flex flex-col items-center gap-2">
                <button
                  onClick={() => handleVote('away')}
                  disabled={Boolean(userVote && userVote !== 'away')}
                  className={`inline-flex items-center justify-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                    userVote === 'away'
                      ? 'border-sky-400/50 bg-sky-400 text-white shadow-[0_8px_20px_rgba(56,189,248,0.18)]'
                      : 'border-white/10 bg-white/8 text-white hover:bg-white/15'
                  }`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>{userVote === 'away' ? 'Voted ✓' : 'Fan Pick'}</span>
                </button>
                <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400">
                  {userVote ? 'Your pick is locked in.' : 'Who lifts the trophy?'}
                </p>
              </div>
            )}
          </div>
        </div>

        {match.events && match.events.length > 0 && (
          <div className="mb-5 rounded-[1.8rem] border border-white/10 bg-slate-900/60 p-4 shadow-[0_10px_30px_rgba(2,6,23,0.2)]">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-300">
                <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500" />
                Match timeline
              </div>
            </div>

            <div className="space-y-3">
              {match.events.map((event) => (
                <div
                  key={event.id}
                  className={`flex items-start gap-3 rounded-[1.3rem] border border-white/10 bg-slate-950/70 p-3 ${event.team === 'home' ? 'border-l-4 border-l-amber-500' : 'border-r-4 border-r-sky-500'}`}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[1.1rem] bg-gradient-to-br from-slate-700 to-slate-800 text-white">
                    {event.type === 'goal' ? (
                      <span className="text-lg">⚽</span>
                    ) : event.type === 'yellow' ? (
                      <span className="text-lg">🟨</span>
                    ) : event.type === 'red' ? (
                      <span className="text-lg">🟥</span>
                    ) : (
                      <span className="text-lg">🔄</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-white">{event.player}</p>
                      <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">{event.minute}'</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {event.type === 'goal'
                        ? `Goal! Assisted by ${event.assist}`
                        : event.type === 'yellow'
                        ? 'Yellow card'
                        : event.type === 'red'
                        ? 'Red card'
                        : `Substitution: ${event.on} on for ${event.off}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-gradient-to-br from-sky-500 to-indigo-600 shadow-md">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium">{match.venue}</span>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
            {match.status || 'Scheduled'}
          </div>
        </div>
      </div>
    </TicketCard>
  );
}
