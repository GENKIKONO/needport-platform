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
  const [active, setActive] = useState<Audience>('general'); // PC初期＝general

  return (
    <section className="mt-12">
      <div className="np-bleed-x">
        <div className="max-w-6xl mx-auto px-4">
          {/* カード行 */}
          <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 lg:px-6">
            {AUDIENCES.map((item) => {
              const isActive = active === item.id;
              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => setActive(item.id)}
                    aria-current={isActive}
                    className={`w-full rounded-xl border bg-white p-4 text-left transition ${
                      isActive 
                        ? "border-[var(--panel-blue-accent)]" 
                        : "border-slate-300"
                    }`}
                  >
                    <span className="font-semibold text-[15px] text-[var(--np-ink)]">{item.label}</span>
                  </button>
                  {isActive && (
                    <span className="absolute left-8 -bottom-2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px]
                      border-l-transparent border-r-transparent border-t-[var(--panel-blue-accent)]" />
                  )}
                </div>
              );
            })}
          </div>

          {/* おすすめ帯 */}
          <div className="relative mx-auto max-w-5xl mt-4 px-4 lg:px-6">
            <div className="rounded-xl bg-[var(--panel-blue-accent)] text-white font-semibold p-4">
              <h3 className="font-bold text-[16px] mb-4">
                {active === 'general' && '一般の方へのおすすめコンテンツ'}
                {active === 'company' && '企業の方へのおすすめコンテンツ'}
                {active === 'gov' && '自治体の方へのおすすめコンテンツ'}
              </h3>

              {/* おすすめカード：SPカルーセル（scroll-snap） */}
              <div className="lg:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">
                {RECOMMENDATIONS[active].map((card, index) => (
                  <Link
                    key={index}
                    href={card.href}
                    className="snap-start shrink-0 w-72 rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/20"
                  >
                    <h3 className="font-semibold text-white">{card.title}</h3>
                    <p className="text-white/80 text-sm mt-1">{card.desc}</p>
                  </Link>
                ))}
              </div>
              {/* PCグリッド */}
              <div className="hidden lg:grid grid-cols-3 gap-5">
                {RECOMMENDATIONS[active].map((card, index) => (
                  <Link
                    key={index}
                    href={card.href}
                    className="rounded-xl bg-white/10 backdrop-blur-sm p-5 border border-white/20 hover:bg-white/20 transition"
                  >
                    <h3 className="font-semibold text-white">{card.title}</h3>
                    <p className="text-white/80 text-sm mt-1">{card.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
