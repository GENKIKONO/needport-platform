export default function ShipIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {/* ship mark */}
      <path fill="currentColor" d="M3 11h3l2-4h8l2 4h3l-9 8-9-8z" />
    </svg>
  );
}
