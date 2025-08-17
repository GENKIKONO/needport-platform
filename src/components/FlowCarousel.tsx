"use client";
import { Anchor, Compass, Users, Handshake, MessageSquare, ShieldCheck } from "lucide-react";

const slides = [
  {
    icon: Compass,
    title: "ニーズを投稿",
    body: "困りごと・目的を具体化して「欲しい」を1分で投稿。個人情報は不要。",
    tip: "匿名ハンドルで安心",
  },
  {
    icon: Users,
    title: "関心が見える化",
    body: "賛同が集まると需要が数で可視化。人数は資金ではなく『需要の目安』です。",
    tip: "クラファンではありません",
  },
  {
    icon: Handshake,
    title: "企業から提案",
    body: "提案を受け取り、投稿者が承認すると案件ルームが作成されます。",
    tip: "承認制で安全",
  },
  {
    icon: MessageSquare,
    title: "案件ルームで進行",
    body: "承認メンバーのみが参加。チャット/マイルストーンで進捗管理。",
    tip: "運営も閲覧可",
  },
  {
    icon: ShieldCheck,
    title: "安心の決済導線",
    body: "必要ならStripe与信（スケルトン実装済）で前払いの不安を低減。",
    tip: "持ち逃げリスクを抑止",
  },
];

export default function FlowCarousel() {
  return (
    <section className="section">
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-blue-700">
          <Anchor className="w-4 h-4" /> NeedPortの流れ
        </div>
        <h2 className="mt-1 text-2xl font-bold text-neutral-900">3分で分かるサービスの使い方</h2>
        <p className="mt-2 text-neutral-700">クラウドファンディングではありません。需要の可視化 → 提案 → 承認制ルームで安心に進めます。</p>
      </div>

      {/* 横スクロール（スナップ） */}
      <div className="relative">
        <div
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
          style={{ scrollPaddingLeft: 16 }}
        >
          {slides.map(({ icon: Icon, title, body, tip }, i) => (
            <article
              key={i}
              className="min-w-[85%] sm:min-w-[420px] snap-start np-card p-5"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                  <Icon className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
              </div>
              <p className="mt-3 text-neutral-700 leading-relaxed">{body}</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs">
                {tip}
              </div>
            </article>
          ))}
        </div>
        {/* ページングのドット（シンプルな目安） */}
        <div className="mt-3 flex justify-center gap-1 text-neutral-300">
          {slides.map((_, i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-current" />
          ))}
        </div>
      </div>
    </section>
  );
}
