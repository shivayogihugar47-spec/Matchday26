import { memo } from 'react';
import TicketCard from './TicketCard';
import { useMatchDayStore } from '../store/useMatchDayStore';
import {
  Zap, Car, DoorOpen, ShieldCheck, CloudSun,
  Ticket as TicketIcon, Utensils, Droplets, Accessibility,
  Timer, Pause, Train, CarTaxiFront, Route,
  DoorOpen as ExitIcon,
} from 'lucide-react';

// ── Static data outside component — never recreated on render ────────────────
const PRE_MATCH = [
  { id: 1, title: 'Find Parking',    description: 'Navigate to nearby garages & lots', icon: <Car className="w-12 h-12" />,        style: 'diagonal', color: 'from-yellow-400 via-orange-500 to-red-500',    size: 'xlarge', delay: 0.05 },
  { id: 2, title: 'Find Gate',       description: 'Your entry is waiting',              icon: <DoorOpen className="w-7 h-7" />,     style: 'circular', color: 'from-blue-400 via-indigo-500 to-purple-600',   size: 'small',  delay: 0.1  },
  { id: 3, title: 'Security Wait',   description: 'Real-time line durations',           icon: <ShieldCheck className="w-7 h-7" />,  style: 'circular', color: 'from-emerald-400 via-green-500 to-teal-600',   size: 'small',  delay: 0.15 },
  { id: 4, title: 'Stadium Weather', description: 'Current conditions outside',         icon: <CloudSun className="w-10 h-10" />,   style: 'angled',   color: 'from-cyan-400 via-blue-500 to-indigo-600',     size: 'medium', delay: 0.2  },
  { id: 5, title: 'Find Seat',       description: 'Step-by-step directions',            icon: <TicketIcon className="w-7 h-7" />,   style: 'angled',   color: 'from-pink-400 via-rose-500 to-red-600',        size: 'medium', delay: 0.25 },
];

const LIVE_MATCH = [
  { id: 1, title: 'Food & Drink',   description: 'Concessions nearby you',    icon: <Utensils className="w-12 h-12" />,      style: 'diagonal', color: 'from-amber-400 via-yellow-500 to-lime-600',   size: 'xlarge', delay: 0.05 },
  { id: 2, title: 'Restrooms',      description: 'Closest facilities',        icon: <Droplets className="w-7 h-7" />,       style: 'circular', color: 'from-sky-400 via-blue-500 to-indigo-600',     size: 'small',  delay: 0.1  },
  { id: 3, title: 'Accessibility',  description: 'Assistance & info',         icon: <Accessibility className="w-7 h-7" />, style: 'circular', color: 'from-green-400 via-emerald-500 to-teal-600',  size: 'small',  delay: 0.15 },
  { id: 4, title: 'Queue Times',    description: 'Avoid long waits',          icon: <Timer className="w-10 h-10" />,        style: 'angled',   color: 'from-violet-400 via-purple-500 to-pink-600',  size: 'medium', delay: 0.2  },
  { id: 5, title: 'Halftime Prep',  description: 'Plan your break now',       icon: <Pause className="w-7 h-7" />,          style: 'angled',   color: 'from-indigo-400 via-blue-500 to-sky-600',     size: 'medium', delay: 0.25 },
];

const POST_MATCH = [
  { id: 1, title: 'Exit Plan',       description: 'Your safe route out',      icon: <ExitIcon className="w-12 h-12" />,      style: 'diagonal', color: 'from-rose-400 via-pink-500 to-violet-600',    size: 'xlarge', delay: 0.05 },
  { id: 2, title: 'Public Transit',  description: 'Trains & buses nearby',    icon: <Train className="w-7 h-7" />,           style: 'circular', color: 'from-cyan-400 via-teal-500 to-emerald-600',   size: 'small',  delay: 0.1  },
  { id: 3, title: 'Picking Up Car',  description: 'Navigate to garage',       icon: <Car className="w-7 h-7" />,             style: 'circular', color: 'from-orange-400 via-amber-500 to-yellow-600', size: 'small',  delay: 0.15 },
  { id: 4, title: 'Rideshare',       description: 'Pickup zones nearby',      icon: <CarTaxiFront className="w-10 h-10" />, style: 'angled',   color: 'from-emerald-400 via-green-500 to-cyan-600',  size: 'medium', delay: 0.2  },
  { id: 5, title: 'Walking Route',   description: 'Avoid crowds safely',      icon: <Route className="w-7 h-7" />,           style: 'angled',   color: 'from-sky-400 via-cyan-500 to-teal-600',       size: 'medium', delay: 0.25 },
];

const SIZE_CLASSES = {
  xlarge: 'min-h-[220px] md:col-span-2 md:row-span-2 p-7 rounded-[1.8rem] shadow-2xl',
  medium: 'min-h-[150px] p-6 rounded-[1.45rem] shadow-xl',
  small:  'min-h-[140px] p-6 rounded-[1.45rem] shadow-xl',
};

function styleClasses(style, color) {
  switch (style) {
    case 'diagonal': return `relative bg-gradient-to-br ${color} [clip-path:polygon(0_0,100%_0,100%_85%,85%_100%,0_100%)]`;
    case 'circular':  return `relative bg-gradient-to-br ${color}`;
    case 'angled':    return `relative bg-gradient-to-br ${color} [clip-path:polygon(15%_0,100%_0,100%_100%,0_100%,0_15%)]`;
    default:          return `bg-gradient-to-br ${color}`;
  }
}

// Memoized individual bento tile
const BentoTile = memo(({ item }) => (
  <div
    className={`cursor-pointer overflow-hidden group relative transition-transform duration-200 hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.98] ${SIZE_CLASSES[item.size] ?? SIZE_CLASSES.small} ${styleClasses(item.style, item.color)}`}
  >
    <div className="absolute inset-0 bg-white/5 transition-colors duration-150 group-hover:bg-white/10" />
    <div className="relative z-10">
      <div className="mb-4 text-white">{item.icon}</div>
      <h4 className="mb-1 font-display text-xl font-bold text-white drop-shadow-md">{item.title}</h4>
      <p className="text-sm leading-relaxed text-white/85">{item.description}</p>
    </div>
  </div>
));
BentoTile.displayName = 'BentoTile';
  
export default function QuickActions() {
  const { phase } = useMatchDayStore();
  const items = phase === 'PRE_MATCH' ? PRE_MATCH : phase === 'LIVE_MATCH' ? LIVE_MATCH : POST_MATCH;

  return (
    <TicketCard className="relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 shadow-2xl shadow-yellow-500/40 transition-transform duration-200 hover:scale-110">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold bg-gradient-to-r from-yellow-200 via-orange-300 to-pink-400 bg-clip-text text-transparent sm:text-3xl">
                MatchDay Moments
              </h3>
              <p className="mt-2 text-base font-medium text-slate-400">Every need, perfectly timed</p>
            </div>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-300">
            Live guidance
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {items.map((item) => <BentoTile key={item.id} item={item} />)}
        </div>
      </div>
    </TicketCard>
  );
}
