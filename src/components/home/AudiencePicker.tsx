"use client";
import { useState } from "react";
import Link from "next/link";

type Audience = 'general' | 'business' | 'government' | 'supporter';

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
    id: 'business' as Audience,
    label: '企業の方へ',
    description: '提案・受注・事業拡大',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    id: 'government' as Audience,
    label: '自治体の方へ',
    description: '地域課題の解決・住民サービス',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    )
  },
  {
    id: 'supporter' as Audience,
    label: '支援者の方へ',
    description: '地域活性化・社会貢献',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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
  business: [
    { title: '事業者登録', desc: '提案を始めよう', href: '/vendor/register' },
    { title: '提案ガイド', desc: '効果的な提案方法', href: '/guide/offer' },
    { title: '成功事例', desc: '他社の取り組み', href: '/success' }
  ],
  government: [
    { title: '自治体向けガイド', desc: '行政での活用方法', href: '/guide/government' },
    { title: '地域課題解決', desc: '住民ニーズの把握', href: '/needs?category=government' },
    { title: 'パートナーシップ', desc: '民間との連携', href: '/partnership' }
  ],
  supporter: [
    { title: '支援者ガイド', desc: '地域活性化への参加', href: '/guide/support' },
    { title: 'ボランティア募集', desc: '活動に参加しよう', href: '/volunteer' },
    { title: '寄付・支援', desc: '地域を応援しよう', href: '/support' }
  ]
};

export default function AudiencePicker() {
  const [active, setActive] = useState<Audience>('general'); // PC/SP共通の初期値

  return (
    <section className="section">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">あなたはどちらですか？</h2>
          <p className="text-slate-600">お客様に合わせたおすすめコンテンツをご案内します</p>
        </div>
        
        {/* オーディエンス選択ボタン行 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          {AUDIENCES.map((item) => (
            <button
              key={item.id}
              aria-pressed={active === item.id}
              onClick={() => setActive(item.id)}
              className={[
                "group rounded-2xl transition shadow-sm",
                active === item.id
                  ? "bg-white ring-2 ring-sky-500"        // 選択時 = 青リングでハイライト
                  : "bg-white/80 hover:bg-white"          // 非選択 = 枠線なし
              ].join(' ')}
            >
              <div className="p-5 lg:p-6 flex items-center gap-3">
                <div className={active === item.id ? "text-sky-600" : "text-slate-500"}>
                  {item.icon}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-800">{item.label}</div>
                  <div className="text-slate-500 text-sm">{item.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* おすすめ面（PC=常時/初期表示, SP=ボタン直下に展開） */}
        <section className="mt-5 lg:mt-6 rounded-2xl bg-[var(--audience-surface)] p-4 lg:p-6">
          {/* SPカルーセル（scroll-snap） */}
          <div className="lg:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">
            {RECOMMENDATIONS[active].map((card, index) => (
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
            {RECOMMENDATIONS[active].map((card, index) => (
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
        </section>
      </div>
    </section>
  );
}
