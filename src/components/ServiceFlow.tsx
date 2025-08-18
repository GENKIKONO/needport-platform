"use client";
import { useState } from "react";
import FlowStrip from "@/components/FlowStrip";
import ServiceFlowCarousel from "@/components/ServiceFlowCarousel"; // ← 追加（綴り完全一致）

const STEPS = [
  { t: "投稿", d: "匿名OKで「欲しい」を投稿" },
  { t: "賛同", d: "仲間が集まるほど実現に近づく" },
  { t: "提案", d: "企業から実現案が届く" },
  { t: "承認", d: "企画を選び、運営が承認" },
  { t: "ルーム", d: "メンバー＋企業＋運営で進行管理" },
  { t: "支払い", d: "Stripeで安全に支払い" },
];

export default function ServiceFlow() {
  const [active, setActive] = useState(0);
  return (
    <section className="bg-white service-flow">
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-neutral-900">サービスの流れ</h2>
        <p className="mt-2 text-neutral-600 text-sm md:text-base">はじめてでも直感で分かるステップ</p>
      </div>

      {/* SP：カルーセル＋上の船 */}
      <div className="md:hidden">
        <ServiceFlowCarousel />
      </div>

      {/* PC：船＋6カード（ここは従来通り） */}
      <div className="hidden md:block">
        <div className="mb-6">
          <FlowStrip active={active} steps={STEPS.length} />
        </div>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {(STEPS ?? []).map((s, i) => (
            <li
              key={i}
              data-step={i + 1}
              tabIndex={0}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className={`rounded-2xl border border-black/5 bg-white p-4 shadow-card cursor-pointer transition
                ${i === active ? "ring-2 ring-sky-300" : "hover:shadow-md"}`}
            >
              <div className="flex items-center gap-2 text-sky-700 font-semibold">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-50 border border-sky-200 text-xs">{i + 1}</span>
                {s.t}
              </div>
              <p className="mt-2 text-sm text-neutral-600">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
