'use client';

import { AnchorIcon, ArrowRightIcon } from "@/components/icons";

const serviceSteps = [
  {
    title: "依頼",
    description: "ニーズを投稿して仲間を集める",
    icon: "📝",
    href: "/service-overview#flow"
  },
  {
    title: "提案",
    description: "事業者からの提案を受け取る",
    icon: "💡",
    href: "/service-overview#flow"
  },
  {
    title: "成立",
    description: "条件を合意して契約成立",
    icon: "🤝",
    href: "/service-overview#flow"
  },
  {
    title: "支払い",
    description: "安全な決済で支払い完了",
    icon: "💳",
    href: "/service-overview#flow"
  },
  {
    title: "サポート",
    description: "進行管理とフォローアップ",
    icon: "🎯",
    href: "/service-overview#flow"
  }
];

export default function HomeServiceSummary() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-8">
          <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
            <AnchorIcon className="h-6 w-6 text-[#196AA6]" />
            サービス航海図（要約）
          </h2>
          <p className="mt-2 text-gray-600">登録から完成までの5つのステップ</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {serviceSteps.map((step, index) => (
            <div key={index} className="bg-white/60 rounded-lg p-4 text-center hover:bg-white/80 transition-colors">
              <div className="text-2xl mb-2">{step.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
              <p className="text-sm text-gray-700">{step.description}</p>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="/needs/new"
            className="flex items-center gap-2 rounded-md bg-[#196AA6] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#155a8a]"
          >
            ニーズを登録
            <ArrowRightIcon className="h-4 w-4" />
          </a>
          <a
            href="/service-overview"
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            航海図を詳しく見る
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
