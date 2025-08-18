"use client";
import {useRef} from "react";
import FlowStrip from "./FlowStrip";

const slides = [
  {t:"投稿", d:"個人情報は書かない"},
  {t:"賛同・提案", d:"業者から見積もり"},
  {t:"承認", d:"運営と安全に進行"},
  {t:"ルーム", d:"関係者だけでやり取り"},
  {t:"支払い", d:"Stripeで安全に"},
];

export default function ServiceFlowCarousel({
  active, onChange,
}: { active:number; onChange:(i:number)=>void }) {
  const ref = useRef<HTMLDivElement>(null);

  const snap = (dir:number) => {
    const el = ref.current; if (!el) return;
    const w = el.clientWidth;
    const next = Math.max(0, Math.min((slides?.length ?? 0) - 1, Math.round((el.scrollLeft + dir*w)/w)));
    el.scrollTo({ left: next * w, behavior: "smooth" });
    onChange(next);
  };

  const onScroll = () => {
    const el = ref.current; if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== active) onChange(i);
  };

  return (
    <div className="space-y-4">
      <FlowStrip active={active} />
      <div className="relative">
        <div
          ref={ref}
          onScroll={onScroll}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-1 px-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {(slides ?? []).map((s, i) => (
            <div key={i} className="snap-start shrink-0 w-[88%] rounded-2xl border border-black/5 bg-white p-4 shadow-card">
              <div className="text-sky-700 font-semibold">{s.t}</div>
              <div className="mt-3 h-28 rounded-xl border border-dashed border-sky-200 bg-sky-50/40" />
              <p className="mt-3 text-sm text-neutral-600">{s.d}</p>
            </div>
          ))}
        </div>

        {/* 矢印ナビ */}
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
