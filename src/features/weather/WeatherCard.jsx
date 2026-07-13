import TicketCard from '../../components/TicketCard';
import { useWeather } from '../../hooks/useWeather';
import { CloudSun, Thermometer, Droplets, CloudRain, XCircle } from 'lucide-react';

export default function WeatherCard() {
  const { data: weather, isLoading, isError } = useWeather();

  if (isLoading) {
    return (
      <TicketCard className="overflow-hidden">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10" />
            <div className="space-y-2">
              <div className="h-5 w-36 rounded-lg bg-white/10" />
              <div className="h-3 w-20 rounded-lg bg-white/10" />
            </div>
          </div>
          <div className="h-20 rounded-2xl bg-white/10" />
        </div>
      </TicketCard>
    );
  }

  if (isError || !weather) {
    return (
      <TicketCard className="overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-yellow-500">
            <XCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="mb-1 font-display text-lg font-bold text-white">Weather</h3>
            <p className="text-sm text-neutral-400">Unable to load weather data</p>
          </div>
        </div>
      </TicketCard>
    );
  }

  const tempF = weather.tempF ?? weather.temperature ?? 72;
  const tempC = weather.tempC ?? Math.round((tempF - 32) * 5 / 9);

  return (
    <TicketCard className="relative overflow-hidden">
      {/* Subtle glows */}
      <div className="pointer-events-none absolute left-4 top-4 h-28 w-28 rounded-full bg-orange-500/10 blur-2xl" />
      <div className="pointer-events-none absolute bottom-4 right-4 h-28 w-28 rounded-full bg-cyan-500/10 blur-2xl" />

      {/* Header */}
      <div className="relative z-10 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-yellow-400 shadow-md shadow-orange-500/25 transition-transform duration-200 hover:scale-105">
            <CloudSun className="h-5 w-5 text-yellow-950" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold bg-gradient-to-r from-orange-200 via-yellow-300 to-cyan-200 bg-clip-text text-transparent">
              Stadium Weather
            </h3>
            <p className="mt-0.5 text-xs font-medium text-slate-400">Current Conditions</p>
          </div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">
          Live
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        {/* Temp */}
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-400/25 bg-gradient-to-br from-orange-400/12 to-yellow-400/12">
            <CloudSun className="h-8 w-8 text-orange-300" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-bold text-white">{tempF}°F</span>
              <span className="text-lg text-slate-400">({tempC}°C)</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-300">
              {weather.source === 'simulated' ? 'Estimated conditions' : 'Clear & Sunny'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 xl:min-w-[340px]">
          {[
            { icon: <Thermometer className="h-4 w-4 text-orange-400" />, label: 'Temp',     value: `${tempF}°F`,           bg: 'from-orange-400/15 to-red-400/15' },
            { icon: <Droplets    className="h-4 w-4 text-blue-400"   />, label: 'Humidity', value: `${weather.humidity}%`,  bg: 'from-blue-400/15 to-cyan-400/15'  },
            { icon: <CloudRain   className="h-4 w-4 text-cyan-400"   />, label: 'Rain',     value: `${weather.rain}%`,      bg: 'from-cyan-400/15 to-teal-400/15'  },
          ].map(({ icon, label, value, bg }) => (
            <div
              key={label}
              className="flex flex-col items-center rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-950/70 p-3 shadow-sm transition-transform duration-150 hover:scale-[1.03]"
            >
              <div className={`mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${bg}`}>
                {icon}
              </div>
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
              <p className="font-mono text-base font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </TicketCard>
  );
}
