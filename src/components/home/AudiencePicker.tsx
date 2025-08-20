"use client";
import { useState } from "react";
import Link from "next/link";

const AUDIENCES = [
  { 
    id: 'general', 
    label: '一般の方へ', 
    description: 'ニーズを探して賛同する', 
    color: 'bg-blue-50 border-blue-200',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  { 
    id: 'business', 
    label: '企業の方へ', 
    description: 'サービスを提供する', 
    color: 'bg-green-50 border-green-200',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  { 
    id: 'government', 
    label: '自治体の方へ', 
    description: '地域の課題を解決する', 
    color: 'bg-purple-50 border-purple-200',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  { 
    id: 'support', 
    label: '支援者の方へ', 
    description: 'プロジェクトを支援する', 
    color: 'bg-orange-50 border-orange-200',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
];

const RECOMMENDATIONS = {
  general: [
    { title: "使い方ガイド", href: "/guide/using", desc: "初めての方へ" },
    { title: "成功事例", href: "/success/stories", desc: "実際の活用例" },
    { title: "よくある質問", href: "/faq", desc: "Q&A" },
  ],
  business: [
    { title: "事業者登録", href: "/vendor/register", desc: "サービス提供を始める" },
    { title: "提案ガイド", href: "/guide/offer", desc: "効果的な提案方法" },
    { title: "事業者インタビュー", href: "/vendors/interviews", desc: "先輩の声" },
  ],
  government: [
    { title: "自治体向けガイド", href: "/guide/government", desc: "地域課題の解決" },
    { title: "成功事例", href: "/success/stories", desc: "自治体の活用例" },
    { title: "無料相談", href: "/support", desc: "導入サポート" },
  ],
  support: [
    { title: "支援者ガイド", href: "/guide/support", desc: "支援の始め方" },
    { title: "プロジェクト一覧", href: "/projects", desc: "支援対象の確認" },
    { title: "支援事例", href: "/success/stories", desc: "支援の成果" },
  ],
};

export default function AudiencePicker() {
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null);

  return (
    <section className="section">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">あなたはどちらですか？</h2>
          <p className="text-gray-600">対象に応じたおすすめコンテンツをご案内します</p>
        </div>
        
        {/* オーディエンス選択 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {AUDIENCES.map((audience) => (
            <button
              key={audience.id}
              onClick={() => setSelectedAudience(audience.id)}
              className={`p-5 rounded-2xl ring-1 ring-slate-200 bg-white hover:shadow-[var(--elev-2)] transition-all text-center
                ${selectedAudience === audience.id 
                  ? 'ring-[var(--blue-600)] bg-[var(--blue-100)]' 
                  : 'hover:ring-slate-300'}`}
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[var(--blue-600)] text-white rounded-full flex items-center justify-center mb-3">
                  {audience.icon}
                </div>
                <h3 className="font-semibold text-[16px] text-[var(--ink-900)] mb-2">{audience.label}</h3>
                <p className="text-sm text-[var(--ink-700)]">{audience.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* おすすめコンテンツ */}
        {selectedAudience && (
          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              {AUDIENCES.find(a => a.id === selectedAudience)?.label}の方へおすすめ
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {RECOMMENDATIONS[selectedAudience as keyof typeof RECOMMENDATIONS]?.map((item, index) => (
                <Link 
                  key={index} 
                  href={item.href}
                  className="block bg-white p-4 rounded-lg border hover:shadow-md transition-all"
                >
                  <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
