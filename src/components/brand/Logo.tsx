import * as React from "react";

type Props = { className?: string; hideText?: boolean };

export default function Logo({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-label="NeedPort">
      <path fill="#0A3D62" d="M8 40h48l-6 10H14L8 40z" />
      <path fill="#155EAB" d="M12 36h40l-2-8H14l-2 8z" />
      <rect x="28" y="14" width="8" height="14" rx="1.5" fill="#0A3D62"/>
      <circle cx="16" cy="54" r="3" fill="#0A3D62"/>
      <circle cx="48" cy="54" r="3" fill="#0A3D62"/>
    </svg>
  );
}
