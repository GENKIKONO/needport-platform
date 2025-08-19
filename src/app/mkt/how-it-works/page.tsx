import MktHeader from "@/mkt/components/MktHeader";
import MktFooter from "@/mkt/components/MktFooter";
import CTAbar from "@/mkt/components/CTAbar";
import { Anchor, Compass } from "lucide-react";

export const metadata = {
  title: "使い方 | NeedPort",
  description: "NeedPortの使い方を詳しく説明します。投稿から安全な支払いまでの5ステップ。",
};

export default function HowItWorksPage() {
  return (
    <>
      <MktHeader />
      <main className="section space-y-8 bg-white pb-20">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 mb-4">
            <Compass className="w-4 h-4" />
            サービスの流れ
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-balance">
            NeedPortの使い方
          </h1>
          <p className="mt-4 text-lg text-neutral-700 text-balance max-w-2xl mx-auto">
            投稿から安全な支払いまで、5つのステップで安心して取引を進められます。
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              step: "1",
              title: "ニーズを投稿",
              description: "困りごとや目的を具体的に投稿します。個人情報は不要で、匿名ハンドルで安心して投稿できます。",
              icon: "📝"
            },
            {
              step: "2", 
              title: "提案が集まる",
              description: "業者から見積もりや方法の提案が届きます。複数の提案を比較して最適なものを選べます。",
              icon: "💡"
            },
            {
              step: "3",
              title: "良い提案を承認",
              description: "気に入った提案を承認すると、案件ルームが作成されます。承認制なので安心です。",
              icon: "check"
            },
            {
              step: "4",
              title: "承認制ルームで進行",
              description: "運営も同席する承認制チャットで詳細を詰めます。直取引の不安がありません。",
              icon: "💬"
            },
            {
              step: "5",
              title: "安全な支払い",
              description: "Stripeの与信・分配で安全に決済・受け渡しを行います。持ち逃げリスクを軽減します。",
              icon: "💳"
            }
          ].map((item, i) => (
            <div key={i} className="np-card p-6 card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">{item.icon}</div>
                <div className="text-sm font-medium text-sky-600">ステップ {item.step}</div>
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 mb-4">
            <Anchor className="w-4 h-4" />
            準備はできましたか？
          </div>
          <p className="text-lg text-neutral-700 mb-6">
            今すぐ無料でニーズを投稿してみましょう
          </p>
          <a href="/post" className="btn btn-primary h-11 px-8">
            無料ではじめる
          </a>
        </div>
      </main>
      <MktFooter />
      <CTAbar />
    </>
  );
}
