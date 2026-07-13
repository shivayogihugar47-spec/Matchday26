import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import TicketCard from './TicketCard';
import { motion } from 'framer-motion';
import { MapPin, Trophy } from 'lucide-react';

// Fix Leaflet's default marker issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// MetLife Stadium coordinates
const METLIFE_STADIUM = [40.8136, -74.0744];

const MapPanel = () => {
  return (
    <TicketCard className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-green-500 shadow-md">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold bg-gradient-to-r from-blue-300 to-green-400 bg-clip-text text-transparent md:text-2xl">
              Stadium Map
            </h3>
            <p className="text-sm text-neutral-400">MetLife Stadium location</p>
          </div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-300">
          Navigation
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="h-80 overflow-hidden rounded-[1.5rem] border border-white/10 shadow-md"
      >
        <MapContainer center={METLIFE_STADIUM} zoom={16} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={METLIFE_STADIUM}>
            <Popup>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-900/95 to-green-900/95 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <h4 className="font-display text-lg font-bold bg-gradient-to-r from-yellow-300 to-green-400 bg-clip-text text-transparent">
                    MetLife Stadium
                  </h4>
                </div>
                <p className="text-neutral-300 text-xs font-semibold">FIFA World Cup 2026 Venue</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </motion.div>
    </TicketCard>
  );
};

export default MapPanel;
