"use client";
import React, { useState } from "react";
import FlowStrip from "./FlowStrip";
import ServiceFlowCarousel from "./ServiceFlowCarousel";

export default function ServiceFlow() {
  // 0〜5（投稿, 賛同, 提案, 承認, ルーム, 支払い）
  const steps = ["投稿","賛同","提案","承認","ルーム","支払い"];
  const [active, setActive] = useState(0);

  return (
    <section className="bg-white">
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-neutral-900">サービスの流れ</h2>
        <p className="mt-2 text-neutral-600 text-sm md:text-base">はじめてでも直感で分かるステップ</p>
      </div>

      {/* モバイル：カルーセル（スワイプで active を更新） */}
      <div className="md:hidden">
        <ServiceFlowCarousel active={active} onChange={setActive} />
      </div>

      {/* デスクトップ：上に船アニメ／下に6カード（カードに連動） */}
      <div className="hidden md:block">
        <div className="mb-6">
          <FlowStrip active={active} steps={steps} showLabels={false} />
        </div>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {[
            {t:"投稿", d:"匿名OKで「欲しい」を投稿"},
            {t:"賛同", d:"仲間が集まるほど実現に近づく"},
            {t:"提案", d:"企業から実現案が届く"},
            {t:"承認", d:"企画を選び、運営が承認"},
            {t:"ルーム", d:"メンバー＋企業＋運営で進行管理"},
            {t:"支払い", d:"Stripeで安全に支払い"}
          ].map((s, i) => (
            <li
              key={i}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className={`rounded-2xl border border-black/5 bg-white p-4 shadow-card outline-none cursor-pointer transition
                ${i===active ? "ring-2 ring-sky-300" : "hover:shadow-md"}`}
              tabIndex={0}
            >
              <div className="flex items-center gap-2 text-sky-700 font-semibold">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-50 border border-sky-200 text-xs">{i+1}</span>
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
