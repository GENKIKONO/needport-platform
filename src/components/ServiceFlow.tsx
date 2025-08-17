import React from "react";
import FlowStrip from "./FlowStrip";
import ServiceFlowCarousel from "./ServiceFlowCarousel";

export default function ServiceFlow() {
  return (
    <section className="bg-white">
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-neutral-900">サービスの流れ</h2>
        <p className="mt-2 text-neutral-600 text-sm md:text-base">はじめてでも直感で分かるステップ</p>
      </div>

      {/* モバイル：カルーセル（船アニメ込み） */}
      <div className="md:hidden">
        <ServiceFlowCarousel />
      </div>

      {/* デスクトップ：上に船アニメ／下に6カード */}
      <div className="hidden md:block">
        <div className="mb-6"><FlowStrip /></div>
        {/* 既存の6カードUIはこの下にそのまま残す */}
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {[
            { key: 'post',    label: '投稿',   note: '匿名OKで「欲しい」を投稿' },
            { key: 'vote',    label: '賛同',   note: '仲間が集まるほど実現に近づく' },
            { key: 'proposal',label: '提案',   note: '企業から実現案が届く' },
            { key: 'approve', label: '承認',   note: '企画を選び、運営が承認' },
            { key: 'room',    label: 'ルーム', note: 'メンバー＋企業＋運営で進行管理' },
            { key: 'pay',     label: '支払い', note: 'Stripeで安全に仮払い', badge: '準備中' },
          ].map((s, i) => (
            <li key={s.key} className="np-card p-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">{i+1}</span>
                {s.badge && (
                  <span className="np-badge bg-amber-50 text-amber-700 border border-amber-200">{s.badge}</span>
                )}
              </div>
              <div className="mt-2 text-neutral-900 font-semibold">{s.label}</div>
              <div className="mt-1 text-neutral-600 text-sm leading-6">{s.note}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
