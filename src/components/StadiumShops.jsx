import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TicketCard from './TicketCard';
import { Utensils, Coffee, ShoppingBag, Truck, Star, MapPin, Flame, X, Phone } from 'lucide-react';

const stadiumVenues = [
  {
    id: 1,
    name: 'Fuku Chicken',
    description: 'Spicy chicken sandwich, crispy fingers, and loaded fries',
    location: 'Sections 117, 224, 330',
    image: '/fuku.jpg',
    icon: <Utensils className="w-5 h-5" />,
    accent: 'from-orange-500 to-red-600',
    glow: 'rgba(249,115,22,0.55)',
    tag: 'Fan Favourite',
    delay: 0.04,
    featured: true,
    contact: '(201) 559-1500',
    menu: [
      { name: 'Spicy Chicken Sandwich', price: '$16', description: 'Crispy chicken, spicy mayo, pickles' },
      { name: 'Crispy Chicken Fingers (6pc)', price: '$14', description: 'Served with honey mustard' },
      { name: 'Loaded Fries', price: '$12', description: 'Cheese, bacon, jalapeños' },
      { name: 'Fuku Soda', price: '$6', description: 'Orange or lemon-lime' },
    ],
  },
  {
    id: 2,
    name: "Nonna Fusco's Kitchen",
    description: 'Authentic meatball subs, pasta dishes, and fresh zeppoles',
    location: 'Sections 118, 215, 239',
    image: "/Nonna Fusco's Kitchen.jpg",
    icon: <Utensils className="w-4 h-4" />,
    accent: 'from-rose-500 to-pink-600',
    glow: 'rgba(244,63,94,0.5)',
    tag: 'Italian',
    delay: 0.1,
    contact: '(201) 559-1501',
    menu: [
      { name: 'Meatball Sub', price: '$18', description: '4 meatballs, marinara, provolone' },
      { name: 'Chicken Parm', price: '$20', description: 'Breaded chicken, marinara, cheese' },
      { name: 'Zeppoles (6pc)', price: '$10', description: 'Powdered sugar, chocolate dipping sauce' },
      { name: 'Garlic Bread', price: '$8', description: 'Buttery garlic, parsley' },
    ],
  },
  {
    id: 3,
    name: "Shah's Halal",
    description: 'Gyro platters, chicken over rice, and pakora chips',
    location: 'Sections 126, 314, MetLife West Hall',
    image: "/Shah's Halal.jpg",
    icon: <Truck className="w-4 h-4" />,
    accent: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16,185,129,0.5)',
    tag: 'Halal',
    delay: 0.16,
    contact: '(201) 559-1502',
    menu: [
      { name: 'Chicken Over Rice', price: '$17', description: 'Chicken, rice, white sauce, salad' },
      { name: 'Gyro Platter', price: '$18', description: 'Gyro meat, rice, white sauce, salad' },
      { name: 'Pakora Chips', price: '$9', description: 'Spiced vegetable fritters' },
      { name: 'Mango Lassi', price: '$7', description: 'Sweet yogurt drink' },
    ],
  },
  {
    id: 4,
    name: 'Mrs. Fields',
    description: 'Warm chocolate chip cookies, brownies, and hot cocoa',
    location: 'All concourses',
    image: '/Mrs. Fields.jpg',
    icon: <Coffee className="w-4 h-4" />,
    accent: 'from-amber-500 to-yellow-600',
    glow: 'rgba(245,158,11,0.5)',
    tag: 'Desserts',
    delay: 0.22,
    contact: '(201) 559-1503',
    menu: [
      { name: 'Chocolate Chip Cookie', price: '$5', description: 'Warm, chewy, gooey' },
      { name: 'Fudge Brownie', price: '$7', description: 'Rich, chocolatey' },
      { name: 'Hot Cocoa', price: '$8', description: 'With whipped cream' },
      { name: 'Cookie Pack (6pc)', price: '$25', description: 'Variety pack' },
    ],
  },
  {
    id: 5,
    name: 'Boardwalk Fryer',
    description: 'Crispy chicken tenders, fried clams, and classic hot dogs',
    location: 'Sections 135, 143, 217, 330',
    image: '/Boardwalk Fryer.jpg',
    icon: <Utensils className="w-4 h-4" />,
    accent: 'from-sky-500 to-blue-600',
    glow: 'rgba(14,165,233,0.5)',
    tag: 'American',
    delay: 0.28,
    contact: '(201) 559-1504',
    menu: [
      { name: 'Classic Hot Dog', price: '$12', description: 'Grilled, with ketchup/mustard' },
      { name: 'Chicken Tenders (5pc)', price: '$15', description: 'Crispy, with BBQ sauce' },
      { name: 'Fried Clams', price: '$22', description: 'Clam strips, tartar sauce' },
      { name: 'Boardwalk Fries', price: '$10', description: 'Crispy, seasoned' },
    ],
  },
  {
    id: 6,
    name: "Patty's Burger",
    description: 'Signature juicy burgers, cheese fries, and cold drinks',
    location: 'Sections 106, 131, 201, 313, 346',
    image: "/Patty's Burger.png",
    icon: <Utensils className="w-4 h-4" />,
    accent: 'from-orange-400 to-amber-600',
    glow: 'rgba(251,146,60,0.5)',
    tag: 'Burgers',
    delay: 0.34,
    contact: '(201) 559-1505',
    menu: [
      { name: 'Signature Patty', price: '$20', description: 'Double patty, cheese, lettuce, tomato' },
      { name: 'Cheese Fries', price: '$12', description: 'Loaded with cheddar' },
      { name: 'Milkshake', price: '$10', description: 'Chocolate, vanilla, strawberry' },
      { name: 'Onion Rings', price: '$11', description: 'Crispy, battered' },
    ],
  },
];

/* ─────────────────────────────────────────────
   FEATURED CARD — wide hero, fixed compact height
───────────────────────────────────────────── */
function FeaturedCard({ venue, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: venue.delay, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-[1.75rem]"
      style={{
        height: '240px',
        boxShadow: hovered
          ? `0 0 0 1.5px ${venue.glow}, 0 32px 80px -16px ${venue.glow}, 0 8px 32px rgba(0,0,0,0.4)`
          : '0 16px 48px rgba(2,6,23,0.4)',
        transition: 'box-shadow 0.4s ease',
      }}
    >
      {/* Full-bleed image */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.img
          src={venue.image}
          alt={venue.name}
          animate={{ scale: hovered ? 1.07 : 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(2,6,23,0.55)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
        <div className={`absolute -right-8 -top-8 h-32 w-32 rotate-45 bg-gradient-to-br ${venue.accent} opacity-70 blur-xl`} />
      </div>

      {/* Overlay content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-5">
        {/* Top badges */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/60 px-3 py-1.5 backdrop-blur-md">
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">{venue.tag}</span>
          </div>
          <div className={`flex items-center gap-1 rounded-full bg-gradient-to-r ${venue.accent} px-2.5 py-1.5 shadow-lg`}>
            <Star className="h-3 w-3 fill-white text-white" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white">Top Pick</span>
          </div>
        </div>

        {/* Bottom info */}
        <motion.div
          animate={{ y: hovered ? 0 : 6, opacity: hovered ? 1 : 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <h4 className="font-display text-2xl font-black leading-tight text-white drop-shadow-lg">
            {venue.name}
          </h4>
          <AnimatePresence>
            {hovered && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-1 text-sm leading-relaxed text-white/80"
              >
                {venue.description}
              </motion.p>
            )}
          </AnimatePresence>
          <div className="mt-2 flex items-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-br ${venue.accent}`} />
            <span className="text-xs font-semibold tracking-wide text-slate-300">{venue.location}</span>
          </div>
        </motion.div>
      </div>
    </motion.article>
  );
}

/* ─────────────────────────────────────────────
   SMALL CARD — pure image, cinematic reveal
───────────────────────────────────────────── */
function VenueCard({ venue, index, className = '', cardHeight = 160, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: venue.delay, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      className={`group relative cursor-pointer overflow-hidden rounded-[1.75rem] ${className}`}
      style={{
        height: `${cardHeight}px`,
        boxShadow: hovered
          ? `0 0 0 1.5px ${venue.glow}, 0 28px 64px -12px ${venue.glow}, 0 8px 24px rgba(0,0,0,0.4)`
          : '0 12px 40px rgba(2,6,23,0.35)',
        transition: 'box-shadow 0.4s ease',
      }}
    >
      {/* Full-bleed image */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.img
          src={venue.image}
          alt={venue.name}
          animate={{ scale: hovered ? 1.1 : 1 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="h-full w-full object-cover"
        />

        {/* Always-on bottom gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent" />

        {/* Watermark index number */}
        <div className="absolute -right-2 -top-3 font-black text-[5.5rem] leading-none text-white/[0.06] select-none pointer-events-none">
          {String(index + 1).padStart(2, '0')}
        </div>

        {/* Tag pill */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className={`absolute left-3 top-3 rounded-full bg-gradient-to-r ${venue.accent} px-2.5 py-1 shadow-lg`}
            >
              <span className="text-[9px] font-black uppercase tracking-[0.28em] text-white">{venue.tag}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom info */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          {/* Icon + name row */}
          <div className="flex items-center gap-2.5">
            <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${venue.accent} text-white shadow-lg transition-transform duration-300 ${hovered ? 'scale-110' : 'scale-100'}`}>
              {venue.icon}
            </div>
            <h4 className="font-display text-[15px] font-bold leading-tight text-white">
              {venue.name}
            </h4>
          </div>

          {/* Description + location — slides up on hover */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="mt-2 space-y-1.5"
              >
                <p className="text-[11px] leading-relaxed text-white/75 line-clamp-2">
                  {venue.description}
                </p>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 flex-shrink-0 text-slate-400" />
                  <span className="text-[10px] font-semibold text-slate-300 truncate">{venue.location}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Colored shimmer sweep on hover */}
        <motion.div
          animate={{ x: hovered ? '100%' : '-100%', opacity: hovered ? 0.15 : 0 }}
          transition={{ duration: 0.6 }}
          className={`pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent ${venue.accent.replace('from-', 'via-').split(' ')[0]} to-transparent`}
        />
      </div>
    </motion.article>
  );
}

/* ─────────────────────────────────────────────
   MENU MODAL
───────────────────────────────────────────── */
function MenuModal({ venue, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl my-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/95 shadow-2xl flex flex-col"
      >
        {/* Modal Header */}
        <div className="relative h-48 flex-shrink-0 overflow-hidden">
          <img src={venue.image} alt={venue.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/80 text-white shadow-lg hover:bg-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-4">
            <h3 className="font-display text-3xl font-black text-white">{venue.name}</h3>
            <p className="text-sm text-slate-300">{venue.location}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Contact Info */}
          <div className="mx-6 mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${venue.accent}`}>
                <Phone className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact</p>
                <p className="font-bold text-white">{venue.contact}</p>
              </div>
            </div>
            <a
              href={`tel:${venue.contact.replace(/[()-\s]/g, '')}`}
              className={`flex items-center gap-2 rounded-xl bg-gradient-to-r ${venue.accent} px-4 py-2 font-bold text-white shadow-lg hover:opacity-90`}
            >
              <Phone className="h-4 w-4" />
              Call Now
            </a>
          </div>

          {/* Menu Items */}
          <div className="mx-6 my-6">
            <h4 className="mb-4 font-display text-xl font-bold text-white">Menu</h4>
            <div className="space-y-3">
              {venue.menu.map((item) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start justify-between rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white">{item.name}</p>
                      <p className={`font-bold bg-gradient-to-r ${venue.accent} bg-clip-text text-transparent`}>{item.price}</p>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */
export default function StadiumShops() {
  const [selectedVenue, setSelectedVenue] = useState(null);
  const featured = stadiumVenues.find((v) => v.featured);
  const rest = stadiumVenues.filter((v) => !v.featured);

  return (
    <TicketCard className="relative overflow-hidden">
      {/* ambient glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-orange-500/8 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-sky-500/8 blur-[80px]" />

      <div className="relative z-10">
        {/* ── Header ── */}
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className="flex items-center justify-center rounded-[1.3rem] bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500 shadow-[0_12px_32px_rgba(251,191,36,0.32)]"
              style={{ height: '3.25rem', width: '3.25rem' }}
            >
              <ShoppingBag className="h-6 w-6 text-yellow-950" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold bg-gradient-to-r from-orange-200 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                Stadium Eats & Shops
              </h3>
              <p className="mt-0.5 text-sm text-slate-400">
                Best concessions and amenities around the bowl
              </p>
            </div>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-300">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            Curated picks
          </div>
        </div>

        {/* ── Grid ──
             Row 1: [Featured wide (col 1-2)] [Stacked pair (col 3)]
             Row 2: [card4] [card5] [card6]
        ── */}
        <div className="flex flex-col gap-4">
          {/* Row 1 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Featured — spans 2 of 3 cols */}
            <div className="sm:col-span-2">
              {featured && <FeaturedCard venue={featured} onClick={() => setSelectedVenue(featured)} />}
            </div>
            {/* Cards 2 & 3 stacked in col 3, each exactly half the featured height */}
            <div className="flex flex-col gap-4">
              {rest.slice(0, 2).map((venue, i) => (
                <VenueCard key={venue.id} venue={venue} index={i} cardHeight={110} onClick={() => setSelectedVenue(venue)} />
              ))}
            </div>
          </div>

          {/* Row 2 — cards 4, 5, 6 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {rest.slice(2).map((venue, i) => (
              <VenueCard key={venue.id} venue={venue} index={i + 2} cardHeight={170} onClick={() => setSelectedVenue(venue)} />
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedVenue && (
          <MenuModal venue={selectedVenue} onClose={() => setSelectedVenue(null)} />
        )}
      </AnimatePresence>
    </TicketCard>
  );
}
