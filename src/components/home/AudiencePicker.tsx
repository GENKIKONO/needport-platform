"use client";
import { useState } from "react";
import Link from "next/link";

const AUDIENCES = [
  { id: 'general', label: '一般', description: 'ニーズを探して賛同する', color: 'bg-blue-50 border-blue-200' },
  { id: 'business', label: '企業', description: 'サービスを提供する', color: 'bg-green-50 border-green-200' },
  { id: 'government', label: '自治体', description: '地域の課題を解決する', color: 'bg-purple-50 border-purple-200' },
  { id: 'support', label: '支援者', description: 'プロジェクトを支援する', color: 'bg-orange-50 border-orange-200' },
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
              className={`p-6 rounded-xl border-2 transition-all hover:shadow-md text-left
                ${selectedAudience === audience.id 
                  ? `${audience.color} border-current` 
                  : 'bg-white border-gray-200 hover:border-gray-300'}`}
            >
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{audience.label}</h3>
                <p className="text-sm text-gray-600">{audience.description}</p>
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
