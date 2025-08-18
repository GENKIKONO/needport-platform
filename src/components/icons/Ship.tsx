export default function ShipIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {/* ship icon */}
      <path fill="currentColor" d="M3 11h3l2-4h8l2 4h3l-9 8-9-8z" />
    </svg>
  );
}
