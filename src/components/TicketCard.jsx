
export default function TicketCard({ children, className = '' }) {
  return (
    <div
      className={`
        relative w-full overflow-hidden rounded-[2.5rem]
        border border-white/10
        bg-[linear-gradient(135deg,rgba(2,8,23,0.95),rgba(8,15,34,0.9))] p-6 sm:p-7
        shadow-[0_18px_70px_rgba(2,6,23,0.35)]
        backdrop-blur-xl
        transition-all duration-300
        hover:border-white/15 hover:bg-[linear-gradient(135deg,rgba(3,9,27,0.97),rgba(12,20,42,0.92))]
        ${className}
      `}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[2.5rem]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,_rgba(251,191,36,0.08),_transparent_30%),radial-gradient(circle_at_88%_100%,_rgba(56,189,248,0.08),_transparent_34%),linear-gradient(135deg,rgba(2,6,23,0.96),rgba(8,15,34,0.92))]" />
        <div className="absolute left-[-10%] top-[-8%] h-32 w-32 rounded-full bg-amber-300/8 blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-8%] h-36 w-36 rounded-full bg-sky-400/8 blur-[80px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>
      <div className="absolute inset-[1px] rounded-[2.48rem] border border-white/10 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
