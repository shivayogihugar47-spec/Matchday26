export default function TicketCard({ children, className = '' }) {
  return (
    <div
      className={`
        relative w-full overflow-hidden rounded-[2rem]
        border border-white/10
        bg-[linear-gradient(145deg,#0a1628,#040810)]
        p-5 sm:p-6
        shadow-[0_8px_32px_rgba(2,6,23,0.4)]
        ${className}
      `}
    >
      {/* Single top-edge highlight line — cheap, no blur */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
