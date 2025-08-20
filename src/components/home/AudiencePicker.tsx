"use client";
import { useState } from "react";
import Link from "next/link";

type Audience = 'general' | 'company' | 'gov';

const AUDIENCES = [
  {
    id: 'general' as Audience,
    label: '一般の方へ',
    description: 'ニーズを探して賛同する',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  {
    id: 'company' as Audience,
    label: '企業の方へ',
    description: 'サービスを提供する',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    id: 'gov' as Audience,
    label: '自治体の方へ',
    description: '地域の課題を解決する',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    )
  }
];

const RECOMMENDATIONS = {
  general: [
    { title: 'ニーズ一覧を見る', desc: '地域のニーズを探してみよう', href: '/needs' },
    { title: '使い方ガイド', desc: '初めての方へ', href: '/guide/using' },
    { title: 'よくある質問', desc: 'Q&Aで解決', href: '/faq' }
  ],
  company: [
    { title: '事業者登録', desc: '提案を始めよう', href: '/vendor/register' },
    { title: '提案ガイド', desc: '効果的な提案方法', href: '/guide/offer' },
    { title: '成功事例', desc: '他社の取り組み', href: '/success' }
  ],
  gov: [
    { title: '自治体向けガイド', desc: '行政での活用方法', href: '/guide/government' },
    { title: '地域課題解決', desc: '住民ニーズの把握', href: '/needs?category=government' },
    { title: 'パートナーシップ', desc: '民間との連携', href: '/partnership' }
  ]
};

export default function AudiencePicker() {
  const [aud, setAud] = useState<Audience>('general'); // PC初期＝general

  return (
    <section className="mt-10">
      {/* 外側の薄グレー帯（PCは左ドック端まで） */}
      <div className="relative bg-[var(--np-surface)] rounded-xl lg:rounded-2xl np-full-bleed-to-aside py-6 lg:py-8">
        {/* 3カード横並び（線だけ） */}
        <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 lg:px-6">
          {AUDIENCES.map((item) => {
            const active = aud === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAud(item.id)}
                aria-current={active}
                className={`relative bg-white rounded-xl px-4 py-5 text-left transition border ${
                  active 
                    ? "border-2 border-[var(--np-blue)] shadow-sm" 
                    : "border-[var(--np-border)]"
                }`}
              >
                {/* コネクタ（選択時のみ） */}
                {active && (
                  <span 
                    aria-hidden
                    className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-2
                               bg-white border-x border-b border-[var(--np-blue)]
                               rounded-b-[6px]" 
                  />
                )}
                {/* アイコン＋ラベル */}
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 text-[var(--np-blue)] ${
                    active ? "scale-[1.06] -translate-y-[1px] transition" : ""
                  }`}>
                    {item.icon}
                  </div>
                  <span className="font-semibold text-[15px] text-[var(--np-ink)]">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 白い内容ボックス（カード群の直下・コネクタ受け） */}
        <div className="relative mx-auto max-w-5xl mt-6 px-4 lg:px-6">
          <div className="relative bg-white rounded-xl border border-[var(--np-border)] p-5 lg:p-7">
            {/* 受けの凹み（上辺中央） */}
            <span 
              aria-hidden
              className="absolute left-1/2 -top-[7px] -translate-x-1/2 w-8 h-[14px]
                         bg-[var(--np-surface)] rounded-t-[10px] border-x border-t border-[var(--np-border)]" 
            />
            {/* 見出し行（選択によってテキストだけ変わる） */}
            <h3 className="mb-4 font-semibold text-[15px] text-[var(--np-ink)]">
              {aud === 'general' && '一般の方へのおすすめコンテンツ'}
              {aud === 'company' && '企業の方へのおすすめコンテンツ'}
              {aud === 'gov' && '自治体の方へのおすすめコンテンツ'}
            </h3>

            {/* おすすめカード：SPカルーセル（scroll-snap） */}
            <div className="lg:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">
              {RECOMMENDATIONS[aud].map((card, index) => (
                <Link
                  key={index}
                  href={card.href}
                  className="snap-start shrink-0 w-72 rounded-xl bg-white shadow-sm p-4"
                >
                  <h3 className="font-semibold text-slate-800">{card.title}</h3>
                  <p className="text-slate-600 text-sm mt-1">{card.desc}</p>
                </Link>
              ))}
            </div>
            {/* PCグリッド */}
            <div className="hidden lg:grid grid-cols-3 gap-5">
              {RECOMMENDATIONS[aud].map((card, index) => (
                <Link
                  key={index}
                  href={card.href}
                  className="rounded-xl bg-white shadow-sm p-5 hover:shadow-md transition"
                >
                  <h3 className="font-semibold text-slate-800">{card.title}</h3>
                  <p className="text-slate-600 text-sm mt-1">{card.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
