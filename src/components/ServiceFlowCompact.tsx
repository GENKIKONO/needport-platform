import FlowStrip from "./FlowStrip";

const pills = [
  { emoji: "📝", t: "困りごと投稿", d: "個人情報は書かない" },
  { emoji: "👍", t: "賛同・提案", d: "業者から見積もり" },
  { emoji: "✅", t: "承認", d: "運営と安全に進行" },
  { emoji: "💬", t: "ルーム", d: "関係者だけでやり取り" },
  { emoji: "💳", t: "支払い", d: "Stripeで安全に" },
];

export default function ServiceFlowCompact() {
  return (
    <div className="space-y-4">
      <FlowStrip />
      <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
        <div className="flex gap-2 min-w-max px-1">
          {pills.map((p, i) => (
            <div key={i} className="flex-shrink-0 bg-white rounded-full border border-sky-200 px-3 py-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-base">{p.emoji}</span>
                <div>
                  <div className="font-medium text-sky-700">{p.t}</div>
                  <div className="text-neutral-500">{p.d}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
