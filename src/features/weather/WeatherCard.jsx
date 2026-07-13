import TicketCard from '../../components/TicketCard';
import { useWeather } from '../../hooks/useWeather';
import { CloudSun, Thermometer, Droplets, CloudRain, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WeatherCard() {
  const { data: weather, isLoading, isError } = useWeather();

  if (isLoading) {
    return (
      <TicketCard className="overflow-hidden">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl" />
            <div className="space-y-2">
              <div className="h-5 w-36 bg-white/10 rounded-lg" />
              <div className="h-3 w-20 bg-white/10 rounded-lg" />
            </div>
          </div>
          <div className="h-20 bg-white/10 rounded-2xl" />
        </div>
      </TicketCard>
    );
  }

  if (isError || !weather) {
    return (
      <TicketCard className="overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-yellow-500 rounded-xl flex items-center justify-center">
            <XCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white mb-1">
              Weather
            </h3>
            <p className="text-neutral-400 text-sm">
              Unable to load weather data
            </p>
          </div>
        </div>
      </TicketCard>
    );
  }

  // Handle both old (temperature) and new (tempF/tempC) formats
  const tempF = weather.tempF !== undefined ? weather.tempF : weather.temperature;
  const tempC = weather.tempC !== undefined ? weather.tempC : Math.round((tempF - 32) * 5 / 9);

  return (
    <TicketCard className="overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-4 left-4 w-28 h-28 bg-gradient-to-br from-orange-500/15 to-transparent rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-28 h-28 bg-gradient-to-br from-cyan-500/15 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: -10, scale: 1.05 }}
            className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/30"
          >
            <CloudSun className="w-5 h-5 text-yellow-950" />
          </motion.div>
          <div>
            <h3 className="font-display text-lg font-bold bg-gradient-to-r from-orange-200 via-yellow-300 to-cyan-200 bg-clip-text text-transparent">
              Stadium Weather
            </h3>
            <p className="text-slate-400 text-xs font-medium mt-1">
              Current Conditions
            </p>
          </div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">
          Live forecast
        </div>
      </div>

      {/* Horizontal Main Content */}
      <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        {/* Left: Big Icon and Temperature */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              y: [0, -4, 0],
              rotate: [0, 1, 0],
              scale: [1, 1.03, 1]
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-400/30 bg-gradient-to-br from-orange-400/15 to-yellow-400/15 shadow-md shadow-orange-500/20"
          >
            <CloudSun className="h-8 w-8 text-orange-300" />
          </motion.div>
          <div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-baseline gap-1.5"
            >
              <span className="font-display text-3xl font-bold text-white">{tempF}°F</span>
              <span className="text-lg text-slate-400">({tempC}°C)</span>
            </motion.div>
            <p className="mt-0.5 text-xs text-slate-300">Clear & Sunny</p>
          </div>
        </div>

        {/* Right: Stats Grid (Horizontal) */}
        <div className="grid grid-cols-3 gap-2 xl:min-w-[360px]">
          <motion.div
            whileHover={{ scale: 1.03, y: -3 }}
            className="flex min-w-[70px] flex-1 flex-col items-center rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-950/70 p-3 shadow-md"
          >
            <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400/20 to-red-400/20">
              <Thermometer className="h-4 w-4 text-orange-400" />
            </div>
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Temp</p>
            <p className="font-mono text-base font-bold text-white">{tempF}°F</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03, y: -3 }}
            className="flex min-w-[70px] flex-1 flex-col items-center rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-950/70 p-3 shadow-md"
          >
            <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400/20 to-cyan-400/20">
              <Droplets className="h-4 w-4 text-blue-400" />
            </div>
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Humidity</p>
            <p className="font-mono text-base font-bold text-white">{weather.humidity}%</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03, y: -3 }}
            className="flex min-w-[70px] flex-1 flex-col items-center rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-950/70 p-3 shadow-md"
          >
            <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/20 to-teal-400/20">
              <CloudRain className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Rain</p>
            <p className="font-mono text-base font-bold text-white">{weather.rain}%</p>
          </motion.div>
        </div>
      </div>
    </TicketCard>
  );
}
