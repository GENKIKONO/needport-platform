"use client";
import FlowStrip from "./FlowStrip";

const flowPills = [
  { icon: "📝", text: "困りごと投稿", desc: "個人情報は書かない" },
  { icon: "👍", text: "賛同・提案", desc: "業者から見積もり" },
  { icon: "✅", text: "良い提案承認", desc: "前進する提案だけ" },
  { icon: "💬", text: "承認制チャット", desc: "運営同席で詰める" },
  { icon: "💳", text: "安全な決済", desc: "Stripeで受け渡し" },
];

export default function ServiceFlowCompact() {
  return (
    <div className="space-y-4">
      {/* 船アニメーション */}
      <FlowStrip />
      
      {/* 横スクロール説明ピル */}
      <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
        <div className="flex gap-2 min-w-max px-1">
          {flowPills.map((pill, i) => (
            <div key={i} className="flex-shrink-0 bg-white rounded-full border border-sky-200 px-3 py-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-base">{pill.icon}</span>
                <div>
                  <div className="font-medium text-sky-700">{pill.text}</div>
                  <div className="text-neutral-500">{pill.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
