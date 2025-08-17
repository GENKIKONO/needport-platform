"use client";
import { useState } from "react";
import Link from "next/link";

const steps = [
  { label:"投稿",   href:"/post" },
  { label:"提案",   href:"/needs" },
  { label:"承認",   href:"/guide#approve" },
  { label:"ルーム", href:"/guide#room" },
  { label:"支払い", href:"/guide#pay" },
];

export default function FlowStrip({ initial = 0 }: { initial?: number }) {
  const [active, setActive] = useState(initial);
  return (
    <div className="relative rounded-2xl border border-black/5 bg-gradient-to-r from-sky-50 to-indigo-50 p-4 shadow-card">
      {/* 航路 */}
      <div className="relative h-2 bg-sky-100 rounded-full">
        <div
          aria-hidden
          className="absolute -top-3 w-6 h-6 transition-[left] duration-500 ease-out"
          style={{ left: `calc(${(active * 100) / 4}% - 12px)` }}
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-sky-600 drop-shadow">
            <path fill="currentColor" d="M3 13l9-8 9 8h-3v6H6v-6H3z" />
          </svg>
        </div>
      </div>
      {/* ステップ */}
      <div className="mt-4 grid grid-cols-5 gap-2 text-sm">
        {steps.map((s, i) => (
          <button
            key={s.label}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            className={`rounded-xl py-3 font-medium transition-colors ${
              i === active ? "bg-white text-sky-700 shadow" : "text-neutral-500 hover:bg-white/70"
            }`}
          >
            <Link href={s.href} className="block w-full h-full">{s.label}</Link>
          </button>
        ))}
      </div>
    </div>
  );
}
