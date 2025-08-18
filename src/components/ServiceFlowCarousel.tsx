"use client";

import FlowStrip from "./FlowStrip";
import { useRef } from "react";

const I = {
  pen:   <svg viewBox="0 0 24 24" className="w-4 h-4 text-sky-700"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.3a1 1 0 0 0-1.41 0l-1.34 1.34l3.75 3.75l1.34-1.35z"/></svg>,
  thumb: <svg viewBox="0 0 24 24" className="w-4 h-4 text-sky-700"><path fill="currentColor" d="M2 21h4V9H2v12zm19-11h-6.31l.95-4.57l.03-.32a1 1 0 0 0-.29-.7L14.17 3L7.59 9.59A2 2 0 0 0 7 11v8a2 2 0 0 0 2 2h7a2 2 0 0 0 1.98-1.75l1-7A2 2 0 0 0 21 10z"/></svg>,
  shield:<svg viewBox="0 0 24 24" className="w-4 h-4 text-sky-700"><path fill="currentColor" d="M12 2l7 4v6c0 5-3.4 9.74-7 10c-3.6-.26-7-5-7-10V6l7-4z"/></svg>,
  chat:  <svg viewBox="0 0 24 24" className="w-4 h-4 text-sky-700"><path fill="currentColor" d="M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>,
  card:  <svg viewBox="0 0 24 24" className="w-4 h-4 text-sky-700"><path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 6H4V8h16v2z"/></svg>,
};

const slides = [
  { t: "投稿",   d: "匿名OKで「欲しい」を投稿。個人情報は書かない。", icon: I.pen },
  { t: "賛同・提案", d: "仲間が集まり、事業者から見積もりや提案が届く。", icon: I.thumb },
  { t: "承認",   d: "企画を選び、運営が承認して進行を整える。", icon: I.shield },
  { t: "ルーム", d: "関係者だけのルームでやり取りと進捗管理。", icon: I.chat },
  { t: "支払い", d: "Stripeで安全に支払い。持ち逃げリスクを低減。", icon: I.card },
];

export default function ServiceFlowCarousel({active, onChange}:{active:number; onChange:(i:number)=>void}) {
  const ref = useRef<HTMLDivElement>(null);
  const snap = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    const w = el.clientWidth;
    el.scrollTo({ left: el.scrollLeft + dir * w, behavior: "smooth" });
    const next = Math.max(0, Math.min(slides.length-1, Math.round((el.scrollLeft + dir*w)/w)));
    onChange(next);
  };
  const onScroll = () => {
    const el = ref.current; if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== active) onChange(i);
  };

  return (
    <div className="space-y-4">
      <FlowStrip />
      <div className="relative">
        <div
          ref={ref}
          onScroll={onScroll}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-1 px-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {slides.map((s, i) => (
            <div key={i} className="snap-start shrink-0 w-[88%] rounded-2xl border border-black/5 bg-white p-4 shadow-card">
              <div className="flex items-center gap-2 text-sky-700 font-semibold">{s.icon}<span>{s.t}</span></div>
              {/* スケッチ置き場（軽いグレーの枠） */}
              <div className="mt-3 h-28 rounded-xl border border-dashed border-sky-200 bg-sky-50/40" />
              <p className="mt-3 text-sm text-neutral-600">{s.d}</p>
            </div>
          ))}
        </div>
        {/* 矢印（任意） */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-1">
          <button onClick={() => snap(-1)} aria-label="prev" className="rounded-full bg-white/80 backdrop-blur border px-2 py-1 shadow">‹</button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center pr-1">
          <button onClick={() => snap(1)} aria-label="next" className="rounded-full bg-white/80 backdrop-blur border px-2 py-1 shadow">›</button>
        </div>
      </div>
    </div>
  );
}
