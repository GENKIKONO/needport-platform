"use client";
import { useState } from "react";

const steps = ["投稿","提案","承認","ルーム","支払い"];

export default function FlowStrip({ initial = 0 }: { initial?: number }) {
  const [active, setActive] = useState(initial);
  return (
    <div className="relative rounded-2xl border border-black/5 bg-gradient-to-r from-sky-50 to-indigo-50 p-3 sm:p-4 shadow-card">
      {/* トラック */}
      <div className="relative h-1.5 sm:h-2 bg-sky-100 rounded-full">
        {/* 船 */}
        <div
          className="absolute -top-2.5 sm:-top-3 w-6 h-6 transition-[left] duration-500 ease-out"
          style={{ left: `calc(${(active * 100) / 4}% - 12px)` }}
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-sky-600 drop-shadow">
            <path fill="currentColor" d="M3 11h3l2-4h8l2 4h3l-9 8-9-8z"/>
          </svg>
        </div>
      </div>
      {/* ラベル */}
      <div className="mt-3 sm:mt-4 grid grid-cols-5 gap-2 text-sm">
        {steps.map((label, i) => (
          <button
            key={label}
            type="button"
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            className={`rounded-xl py-2 sm:py-3 text-center transition-colors ${
              i === active ? "bg-white text-sky-700 shadow font-medium" : "text-neutral-500 hover:bg-white/70"
            }`}
            aria-pressed={i === active}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
