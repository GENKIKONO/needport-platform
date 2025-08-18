export default function Logo({ showText = true }: { showText?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <svg viewBox="0 0 24 24" className="w-6 h-6 text-sky-600" aria-hidden>
        {/* ship(新) */}
        <path fill="currentColor" d="M3 11h3l2-4h8l2 4h3l-9 8-9-8z"/>
      </svg>
      {showText && <span className="font-semibold tracking-tight">NeedPort</span>}
    </div>
  );
}
