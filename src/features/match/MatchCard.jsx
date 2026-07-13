import { useState, useEffect } from 'react';
import TicketCard from '../../components/TicketCard';
import { useMatchStatus } from '../../hooks/useMatchStatus';
import { useMatchDayStore } from '../../store/useMatchDayStore';
import { Trophy, Clock, MapPin, XCircle, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';

// Final match date: July 19, 2026 15:00 ET
const FINAL_KICKOFF = new Date('2026-07-19T15:00:00-04:00'); // EDT (UTC-4)

// Safe date formatting function
function formatDateSafely(dateString, options = {}) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', options);
  } catch (e) {
    return '';
  }
}

function formatTimeSafely(dateString, options = {}) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', options);
  } catch (e) {
    return '';
  }
}

export default function MatchCard() {
  const { data: match, isLoading, isError } = useMatchStatus();
  const { phase } = useMatchDayStore();
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [userVote, setUserVote] = useState(null);
  const [pulseTeam, setPulseTeam] = useState(null);

  // Update countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = FINAL_KICKOFF - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!pulseTeam || typeof window === 'undefined') {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setPulseTeam(null), 220);
    return () => window.clearTimeout(timeoutId);
  }, [pulseTeam]);

  // Handle vote
  const handleVote = (team) => {
    if (userVote) {
      return;
    }

    setUserVote(team);
    setPulseTeam(team);
  };

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
              <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-amber-300">FIFA World Cup 2026</p>
              <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
                Final Match Day
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Days', value: countdown.days },
              { label: 'Hours', value: countdown.hours },
              { label: 'Minutes', value: countdown.minutes },
              { label: 'Seconds', value: countdown.seconds }
            ].map((item, index) => (
              <div key={item.label} className={`rounded-[1.25rem] border border-white/10 p-3 text-center ${isPreMatch ? 'bg-slate-950/80' : 'bg-slate-950/70'} ${isPreMatch && index === 0 ? 'sm:scale-[1.03]' : ''}`}>
                <div className={`font-display text-2xl font-bold text-white sm:text-3xl ${isPreMatch ? 'text-amber-50' : ''}`}>
                  {String(item.value).padStart(2, '0')}
                </div>
                <div className={`mt-1 text-[10px] font-semibold uppercase tracking-[0.3em] ${isPreMatch ? 'text-amber-200/80' : 'text-slate-400'}`}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Headline: Pick your favorite to reach the final! */}
        <div className="mb-6 text-center">
          <h2 className="font-display text-2xl font-bold bg-gradient-to-r from-amber-300 via-yellow-200 to-sky-300 bg-clip-text text-transparent sm:text-3xl">
            Before the Final: Pick Your Favorite Who Will Win and Reach the Final
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Cast your vote for the team you think will make it all the way!
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <motion.div whileHover={{ scale: 1.01 }} className={`rounded-[1.8rem] border p-4 text-center shadow-[0_12px_40px_rgba(251,191,36,0.12)] ${isPreMatch ? 'border-amber-400/20 bg-[linear-gradient(135deg,rgba(251,191,36,0.18),rgba(2,6,23,0.84))] sm:scale-[1.01]' : 'border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.94),rgba(2,6,23,0.82))] opacity-90'}`}>
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/25 bg-gradient-to-br from-amber-300/20 to-orange-500/10 shadow-[0_8px_24px_rgba(251,191,36,0.14)]"
            >
              <span className="font-display text-3xl font-bold text-amber-100">
                {homeTeamDisplay.split(' ').map(word => word[0]).join('').slice(0, 2)}
              </span>
            </motion.div>
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="rounded-full border border-white/10 bg-slate-950/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-100/90">
                Match sheet
              </span>
              <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">
                Home
              </span>
            </div>
            <p className="font-display text-lg font-semibold uppercase text-white">{homeTeamDisplay}</p>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-200/80">Official side</p>
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
                  <span>{userVote === 'home' ? 'Voted' : 'Fan Pick'}</span>
                </button>
                <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400">
                  {userVote ? 'Your pick is locked in.' : 'Choose one team for this session.'}
                </p>
              </div>
            )}
          </motion.div>

          <motion.div whileHover={{ scale: 1.01 }} className={`rounded-[2.2rem] border px-5 py-4 shadow-[0_16px_45px_rgba(2,6,23,0.3)] ${isLiveMatch ? 'border-amber-400/20 bg-[linear-gradient(135deg,rgba(251,191,36,0.16),rgba(15,23,42,0.95))] sm:scale-[1.02]' : 'border-white/10 bg-[linear-gradient(135deg,rgba(2,6,23,0.96),rgba(15,23,42,0.9))] opacity-90'}`}>
            <div className="flex flex-col items-center gap-3">
              <div className={`rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] ${isLiveMatch ? 'text-amber-100' : 'text-slate-300'}`}>
                {hasLiveScore ? 'Live score' : 'Scheduled kickoff'}
              </div>
              {hasLiveScore ? (
                <div className="flex items-center justify-center gap-4">
                  <motion.span
                    key={match.score.home}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-mono text-5xl font-bold text-amber-200 drop-shadow-[0_0_12px_rgba(251,191,36,0.16)]"
                  >
                    {match.score.home}
                  </motion.span>
                  <div className="flex flex-col gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  </div>
                  <motion.span
                    key={match.score.away}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="font-mono text-5xl font-bold text-sky-200 drop-shadow-[0_0_12px_rgba(56,189,248,0.16)]"
                  >
                    {match.score.away}
                  </motion.span>
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
          </motion.div>

          <motion.div whileHover={{ scale: 1.01 }} className={`rounded-[1.8rem] border p-4 text-center shadow-[0_12px_40px_rgba(56,189,248,0.12)] ${isPreMatch ? 'border-sky-400/20 bg-[linear-gradient(135deg,rgba(56,189,248,0.12),rgba(2,6,23,0.84))] opacity-90' : 'border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(2,6,23,0.82))] opacity-85'}`}>
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.25 }}
              className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border border-sky-400/25 bg-gradient-to-br from-sky-300/20 to-blue-500/10 shadow-[0_8px_24px_rgba(56,189,248,0.14)]"
            >
              <span className="font-display text-3xl font-bold text-sky-100">
                {awayTeamDisplay.split(' ').map(word => word[0]).join('').slice(0, 2)}
              </span>
            </motion.div>
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="rounded-full border border-white/10 bg-slate-950/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-100/90">
                Match sheet
              </span>
              <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">
                Away
              </span>
            </div>
            <p className="font-display text-lg font-semibold uppercase text-white">{awayTeamDisplay}</p>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-200/80">Official side</p>
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
                  <span>{userVote === 'away' ? 'Voted' : 'Fan Pick'}</span>
                </button>
                <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400">
                  {userVote ? 'Your pick is locked in.' : 'Choose one team for this session.'}
                </p>
              </div>
            )}
          </motion.div>
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
              {match.events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: event.team === 'home' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={`flex items-start gap-3 rounded-[1.3rem] border border-white/10 bg-slate-950/70 p-3 ${
                    event.team === 'home' ? 'border-l-4 border-l-amber-500' : 'border-r-4 border-r-sky-500'
                  }`}
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
                </motion.div>
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
