import { useEffect, useMemo, useState, useCallback, memo, useRef } from 'react';
import TicketCard from '../../components/TicketCard';
import { useMutation } from '@tanstack/react-query';
import { mockZones } from '../../services/mockData';
import { Activity, Users, Radio, TrendingUp, TrendingDown, Minus, X } from 'lucide-react';

/* ── helpers ── */
const getZonePosition = (index, total) => {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return { x: Math.cos(angle) * 108, y: Math.sin(angle) * 108 };
};

const getZoneStatus = (zone) => {
  if (zone.congestion < 0.4) return {
    label: 'Flowing', short: 'FLOW',
    tone: 'text-emerald-300', ring: '#34d399',
    glow: 'rgba(52,211,153,0.5)',
    bar: 'from-emerald-400 to-teal-400',
    chip: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300',
    dot: 'bg-emerald-400',
  };
  if (zone.congestion < 0.7) return {
    label: 'Steady', short: 'BUSY',
    tone: 'text-amber-300', ring: '#fbbf24',
    glow: 'rgba(251,191,36,0.5)',
    bar: 'from-amber-400 to-yellow-300',
    chip: 'border-amber-400/30 bg-amber-500/15 text-amber-300',
    dot: 'bg-amber-400',
  };
  return {
    label: 'Packed', short: 'PEAK',
    tone: 'text-rose-300', ring: '#fb7185',
    glow: 'rgba(251,113,133,0.55)',
    bar: 'from-rose-400 to-pink-500',
    chip: 'border-rose-400/30 bg-rose-500/15 text-rose-300',
    dot: 'bg-rose-400',
  };
};

const getTrendIcon = (trend) => {
  if (trend === 'increasing') return <TrendingUp className="h-3 w-3 text-rose-400" />;
  if (trend === 'decreasing') return <TrendingDown className="h-3 w-3 text-emerald-400" />;
  return <Minus className="h-3 w-3 text-slate-400" />;
};

const congestionToValue = (level) => {
  switch (level) {
    case 'medium': return 0.52;
    case 'heavy': return 0.76;
    case 'extreme': return 0.92;
    default: return 0.28;
  }
};

/* ── Gate node on the radar map ── */
const GateNode = memo(function GateNode({ zone, idx, total, isSelected, onClick }) {
  const position = getZonePosition(idx, total);
  const status = getZoneStatus(zone);
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 focus:outline-none"
      style={{ left: `calc(50% + ${position.x}px)`, top: `calc(50% + ${position.y}px)` }}
    >
      {/* Pulse ring */}
      {(isSelected || hovered) && (
        <span
          className="absolute h-14 w-14 animate-ping rounded-full opacity-50"
          style={{ background: `radial-gradient(circle, ${status.glow}, transparent 70%)` }}
        />
      )}
      {/* Circle */}
      <div
        className="relative flex h-12 w-12 flex-col items-center justify-center rounded-full border border-white/10 bg-slate-950/90 backdrop-blur transition-shadow duration-200"
        style={{
          boxShadow: isSelected
            ? `0 0 0 2px ${status.ring}, 0 0 16px 4px ${status.glow}`
            : hovered
            ? `0 0 0 1.5px ${status.ring}80`
            : `0 4px 12px rgba(2,6,23,0.5)`,
        }}
      >
        <div className={`h-2 w-2 rounded-full ${status.dot}`} />
        <span className={`mt-0.5 text-[8px] font-black tracking-widest ${status.tone}`}>{status.short}</span>
      </div>
      {/* Label */}
      <div className="flex flex-col items-center">
        <span className="max-w-[72px] text-center text-[8px] font-bold uppercase tracking-wider text-white/80 leading-tight">
          {zone.name.replace(' Gate', '')}
        </span>
        <span className="text-[8px] text-slate-500">{zone.waitTime}m</span>
      </div>
    </button>
  );
});

/* ── Zone list row ── */
const ZoneRow = memo(function ZoneRow({ zone, rank }) {
  const status = getZoneStatus(zone);
  const pct = Math.round(zone.congestion * 100);

  return (
    <div className="group flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 transition-colors duration-150 hover:bg-white/[0.06]">
      <span className="w-4 flex-shrink-0 text-[11px] font-black text-slate-600">
        {String(rank + 1).padStart(2, '0')}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 flex-shrink-0 rounded-full ${status.dot}`} />
          <span className="truncate text-sm font-semibold text-white">{zone.name}</span>
          <span className="ml-auto flex-shrink-0">{getTrendIcon(zone.trend)}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${status.bar} transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="flex flex-shrink-0 flex-col items-end gap-0.5">
        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${status.chip}`}>
          {status.label}
        </span>
        <span className="text-[10px] text-slate-500">{zone.waitTime} min</span>
      </div>
    </div>
  );
});

/* ── Main ── */
export default function CrowdReportPanel() {
  const [reportingZone, setReportingZone] = useState(null);
  const [congestionLevel, setCongestionLevel] = useState('light');
  const [waitTime, setWaitTime] = useState('5');
  const [zones, setZones] = useState(() => {
    if (typeof window === 'undefined') return mockZones.map((z) => ({ ...z }));
    const saved = window.localStorage.getItem('crowd-map-zones');
    if (saved) { try { return JSON.parse(saved); } catch { /* fall through */ } }
    return mockZones.map((z) => ({ ...z }));
  });

  // Debounced localStorage write — avoids serializing on every keystroke/update
  const lsTimerRef = useRef(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    clearTimeout(lsTimerRef.current);
    lsTimerRef.current = setTimeout(() => {
      window.localStorage.setItem('crowd-map-zones', JSON.stringify(zones));
    }, 500);
    return () => clearTimeout(lsTimerRef.current);
  }, [zones]);

  const reportMutation = useMutation({
    mutationFn: async ({ zone, congestion, waitTime }) => {
      const res = await fetch('/api/crowd-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone, congestion, waitTime: parseInt(waitTime, 10) * 60 }),
      });
      if (!res.ok) throw new Error('Failed to report');
      return res.json();
    },
  });

  const handleSubmitReport = () => {
    const selectedZone = zones.find((z) => z.id === reportingZone);
    if (!selectedZone) return;
    reportMutation.mutate({ zone: selectedZone.name, congestion: congestionLevel, waitTime }, {
      onSuccess: () => {
        const nextCongestion = Math.min(0.95, Math.max(0.18, selectedZone.congestion * 0.45 + congestionToValue(congestionLevel) * 0.55));
        const nextWaitTime = Math.max(2, Math.min(30, Math.round(selectedZone.waitTime * 0.65 + parseInt(waitTime, 10) * 0.35)));
        const nextTrend = nextCongestion > 0.7 ? 'increasing' : nextCongestion > 0.4 ? 'steady' : 'stable';
        setZones((prev) => prev.map((z) => z.id === reportingZone
          ? { ...z, congestion: nextCongestion, waitTime: nextWaitTime, reportCount: z.reportCount + 1, trend: nextTrend, recommended: nextCongestion < 0.4 }
          : z));
        setReportingZone(null);
        setCongestionLevel('light');
        setWaitTime('5');
      },
    });
  };

  const rankedZones = useMemo(() => [...zones].sort((a, b) => b.congestion - a.congestion), [zones]);
  const busiestZone = rankedZones[0];
  const totalReports = zones.reduce((sum, z) => sum + z.reportCount, 0);
  const avgWait = Math.round(zones.reduce((sum, z) => sum + z.waitTime, 0) / zones.length);
  const busiestStatus = busiestZone ? getZoneStatus(busiestZone) : null;

  return (
    <TicketCard className="flex w-full flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 shadow-[0_12px_28px_rgba(251,191,36,0.28)]">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold bg-gradient-to-r from-amber-200 via-emerald-300 to-sky-300 bg-clip-text text-transparent md:text-2xl">
              Crowd Map
            </h3>
            <p className="text-xs text-slate-400">Tap a gate to submit a live crowd report</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5">
            <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-300">{totalReports} reports</span>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-300">
            Avg wait · {avgWait} min
          </div>
        </div>
      </div>

      {/* ── Two-col layout ── */}
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">

        {/* ── Left: Radar map ── */}
        <div className="flex flex-col gap-3">
          <div className="relative mx-auto flex w-full max-w-[360px] aspect-square items-center justify-center xl:max-w-full">
            {/* Outer card */}
            <div className="absolute inset-0 rounded-[2rem] border border-white/8 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),rgba(2,6,23,0.98)_70%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" />

            {/* Concentric rings */}
            <div className="absolute inset-[12%] rounded-full border border-white/[0.07]" />
            <div className="absolute inset-[28%] rounded-full border border-dashed border-white/[0.07]" />
            <div className="absolute inset-[44%] rounded-full border border-white/[0.07]" />

            {/* Cross hairs */}
            <div className="absolute inset-x-[12%] top-1/2 h-px bg-white/[0.04]" />
            <div className="absolute inset-y-[12%] left-1/2 w-px bg-white/[0.04]" />

            {/* Center hub */}
            <div className="relative z-10 flex h-12 w-12 flex-col items-center justify-center rounded-full border border-white/10 bg-slate-950/90 backdrop-blur-sm shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <Activity className="h-4 w-4 text-sky-400" />
            </div>

            {/* Label top */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full border border-white/8 bg-slate-950/80 px-3 py-1 text-[9px] font-black uppercase tracking-[0.35em] text-slate-400 backdrop-blur-sm">
              Crowd Pulse
            </div>

            {/* Gate nodes */}
            {zones.map((zone, idx) => (
              <GateNode
                key={zone.id}
                zone={zone}
                idx={idx}
                total={zones.length}
                isSelected={reportingZone === zone.id}
                onClick={() => setReportingZone(reportingZone === zone.id ? null : zone.id)}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4">
            {[
              { dot: 'bg-emerald-400', label: 'Flowing' },
              { dot: 'bg-amber-400', label: 'Steady' },
              { dot: 'bg-rose-400', label: 'Packed' },
            ].map(({ dot, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full ${dot}`} />
                <span className="text-[10px] font-semibold text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Pulse + Zone list ── */}
        <div className="flex flex-col gap-3">

          {/* Current Pulse card */}
          {busiestZone && busiestStatus && (
            <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(2,6,23,0.95))] p-4 shadow-[0_16px_45px_rgba(2,6,23,0.3)]">
              {/* Glow blob */}
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl opacity-30"
                style={{ background: busiestStatus.glow }}
              />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.35em] text-slate-500">
                    <Activity className="h-3 w-3 text-amber-400" />
                    Current Pulse
                  </div>
                  <p className="text-xl font-black text-white leading-tight">{busiestZone.name}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {busiestZone.reportCount} reports · {busiestZone.waitTime} min wait
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Peak</p>
                    <p className="text-2xl font-black text-white leading-none mt-0.5">
                      {Math.round(busiestZone.congestion * 100)}
                      <span className="text-sm text-slate-400">%</span>
                    </p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${busiestStatus.chip}`}>
                    {busiestStatus.label}
                  </span>
                </div>
              </div>

              {/* Congestion bar */}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${busiestStatus.bar} transition-all duration-700`}
                  style={{ width: `${Math.round(busiestZone.congestion * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Zone list */}
          <div className="flex flex-col gap-2">
            {rankedZones.map((zone, rank) => (
              <ZoneRow key={zone.id} zone={zone} rank={rank} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Report form ── */}
      {reportingZone && (
        <div className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-white/6 via-white/3 to-transparent p-5">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h4 className="font-display text-base font-bold text-white">
                  Report crowd at <span className="text-amber-300">{zones.find((z) => z.id === reportingZone)?.name}</span>
                </h4>
                <p className="mt-0.5 text-xs text-slate-400">Updates the live crowd state on the map</p>
              </div>
              <button
                onClick={() => setReportingZone(null)}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* How busy */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">How busy?</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'light', label: 'Light', color: 'emerald' },
                    { value: 'medium', label: 'Medium', color: 'amber' },
                    { value: 'heavy', label: 'Heavy', color: 'orange' },
                    { value: 'extreme', label: 'Gridlock', color: 'rose' },
                  ].map(({ value, label, color }) => (
                    <button
                      key={value}
                      onClick={() => setCongestionLevel(value)}
                      className={`rounded-2xl border py-2.5 text-xs font-bold transition-all ${
                        congestionLevel === value
                          ? `border-${color}-400/40 bg-${color}-500/20 text-${color}-300 shadow-[0_0_12px_rgba(0,0,0,0.2)]`
                          : 'border-white/8 bg-white/4 text-slate-400 hover:bg-white/8'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wait time */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Wait time</label>
                  <span className="font-mono text-lg font-black text-white">{waitTime}<span className="text-xs text-slate-400 ml-1">min</span></span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={waitTime}
                  onChange={(e) => setWaitTime(e.target.value)}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-amber-400"
                />
                <div className="mt-1.5 flex justify-between text-[9px] font-semibold text-slate-600 uppercase tracking-widest">
                  <span>1 min</span>
                  <span>30 min</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setReportingZone(null)}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/8 py-2.5 text-sm font-bold text-slate-300 transition-colors hover:bg-white/12 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={reportMutation.isPending}
                  className="flex-grow rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 py-2.5 text-sm font-bold text-slate-950 transition-opacity hover:opacity-90 disabled:opacity-60 active:scale-95"
                >
                  {reportMutation.isPending ? 'Sending…' : 'Submit Report'}
                </button>
              </div>
            </div>
        </div>
      )}
    </TicketCard>
  );
}
