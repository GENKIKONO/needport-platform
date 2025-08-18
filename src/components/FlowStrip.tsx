"use client";
import { useMemo } from "react";

type Props = { active: number; steps: string[]; showLabels?: boolean };
export default function FlowStrip({ active, steps, showLabels = false }: Props) {
  const denom = Math.max(steps.length - 1, 1);
  const left = useMemo(() => `calc(${(active * 100) / denom}% - 12px)`, [active, denom]);
  return (
    <div className="relative rounded-2xl border border-black/5 bg-gradient-to-r from-sky-50 to-indigo-50 p-3 sm:p-4 shadow-card">
      {/* トラック */}
      <div className="relative h-1.5 sm:h-2 bg-sky-100 rounded-full">
        {/* 船 */}
        <div className="absolute -top-2.5 sm:-top-3 w-6 h-6 transition-[left] duration-500 ease-out" style={{ left }}>
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-sky-600 drop-shadow">
            <path fill="currentColor" d="M3 11h3l2-4h8l2 4h3l-9 8-9-8z"/>
          </svg>
        </div>
      </div>
      {/* ラベル：必要なときだけ（デフォルト非表示） */}
      {showLabels && (
        <div className="mt-3 sm:mt-4 grid grid-cols-6 gap-2 text-xs sm:text-sm text-neutral-500">
          {steps.map((s, i) => (<div key={i} className="text-center">{s}</div>))}
        </div>
      )}
    </div>
  );
}
