import * as React from "react";

type Props = { className?: string; hideText?: boolean };

export function Logo({ className = "", hideText = false }: Props) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label="NeedPort">
      {/* Ship icon (inline SVG) */}
      <svg
        width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"
        className="text-slate-800 dark:text-slate-100"
        fill="currentColor"
      >
        {/* hull */}
        <path d="M3 16l2 4h14l2-4-9-3-9 3z" />
        {/* deck + bridge */}
        <path d="M9 10h6v2H9zM10 7h4v2h-4z" />
        {/* bow waves */}
        <path d="M5 20c1.2 0 1.8-.6 2.6-.6S9 20 10.2 20s1.8-.6 2.6-.6S15 20 16.2 20s1.8-.6 2.6-.6S21 20 22 20h-17z" />
      </svg>
      {!hideText && <span className="text-lg font-semibold tracking-tight">NeedPort</span>}
    </span>
  );
}
export default Logo;
