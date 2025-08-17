"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = { durationMs?: number; onDone?: () => void };

export default function BoatSail({ durationMs = 2800, onDone }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => onDone?.(), durationMs);
    return () => clearTimeout(t);
  }, [durationMs, onDone]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] pointer-events-none [--dur:2.8s]">
      {/* 波面（ほんのり） */}
      <div className="absolute bottom-16 left-0 right-0 h-16 opacity-70">
        <svg className="w-full h-full" viewBox="0 0 800 100" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="npWave" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(59,130,246,.20)" />
              <stop offset="100%" stopColor="rgba(59,130,246,0)" />
            </linearGradient>
          </defs>
          <path d="M0,60 C120,20 240,100 360,60 C480,20 600,100 720,60 L800,60 L800,100 L0,100 Z" fill="url(#npWave)"/>
        </svg>
      </div>

      {/* 船本体 */}
      <div className="np-boat absolute bottom-20 -left-[20vw] will-change-transform">
        <svg width="140" height="80" viewBox="0 0 140 80" aria-label="船が通過中">
          {/* 甲板/船体 */}
          <g fill="currentColor" className="text-blue-600">
            <path d="M10 55h80l8 12H24z" opacity=".95"/>
            <rect x="28" y="34" width="32" height="14" rx="2" fill="currentColor" opacity=".9"/>
          </g>
          {/* 帆（NeedPortのNを意識） */}
          <path d="M75 16 L75 48 C100 42 110 28 118 16 Z" fill="#3b82f6" opacity=".95"/>
          {/* マスト */}
          <rect x="73" y="12" width="4" height="40" rx="1" fill="#1e40af"/>
          {/* 白い引き波 */}
          <path className="np-wake" d="M18 66 C38 62 58 74 78 68 C98 62 118 75 138 69" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round"/>
        </svg>
      </div>
    </div>,
    document.body
  );
}
