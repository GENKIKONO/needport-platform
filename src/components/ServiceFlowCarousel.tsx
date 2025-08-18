"use client";
import { useEffect, useRef, useState } from "react";
import FlowStrip from "@/components/FlowStrip";

const SLIDES = [
  { t: "投稿",  d: "匿名OKで「欲しい」を投稿" },
  { t: "賛同",  d: "仲間が集まるほど実現に近づく" },
  { t: "提案",  d: "企業から実現案が届く" },
  { t: "承認",  d: "企画を選び、運営が承認" },
  { t: "ルーム", d: "メンバー＋企業＋運営で進行管理" },
  { t: "支払い", d: "Stripeで安全に支払い" },
];

export default function ServiceFlowCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onScroll = () => setActive(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll as any);
  }, []);

  const go = (dir: number) => {
    const el = ref.current; if (!el) return;
    const n = (SLIDES?.length ?? 0);
    const w = el.clientWidth;
    const next = Math.max(0, Math.min(n - 1, Math.round((el.scrollLeft + dir * w) / w)));
    el.scrollTo({ left: next * w, behavior: "smooth" });
    setActive(next);
  };

  return (
    <div className="space-y-4">
      <FlowStrip active={active} steps={SLIDES.length} />
      <div className="relative">
        <div
          ref={ref}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-1 px-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {(SLIDES ?? []).map((s, i) => (
            <div key={i} className="snap-start shrink-0 w-[88%] rounded-2xl border border-black/5 bg-white p-4 shadow-card">
              <div className="text-sky-700 font-semibold">{s.t}</div>
              <p className="mt-2 text-sm text-neutral-600">{s.d}</p>
            </div>
          ))}
        </div>
        <button onClick={() => go(-1)} aria-label="prev" className="absolute inset-y-0 left-0 my-auto rounded-full bg-white/80 border px-2 py-1 shadow">‹</button>
        <button onClick={() => go(1)}  aria-label="next" className="absolute inset-y-0 right-0 my-auto rounded-full bg-white/80 border px-2 py-1 shadow">›</button>
      </div>
    </div>
  );
}
