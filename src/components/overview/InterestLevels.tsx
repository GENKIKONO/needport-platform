'use client';
// アイコンは一時的に無効化

const Card = ({ title, badge, desc, req }: any) => (
  <div className="rounded-md border border-[var(--c-border)] bg-[var(--c-card)] p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-[var(--c-text)]">{title}</h3>
      <span className="rounded-full bg-[var(--c-blue-bg)] px-2 py-0.5 text-xs text-[var(--c-blue-strong)]">{badge}</span>
    </div>
    <p className="mt-2 text-sm text-[var(--c-text-muted)]">{desc}</p>
    <p className="mt-3 text-xs text-[var(--c-text-muted)]">{req}</p>
  </div>
);

export default function InterestLevels() {
  // イベント追跡は一時的に無効化
  
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-[var(--c-blue-strong)] flex items-center gap-2 sm:gap-2 lg:gap-3">
          <span className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-[var(--c-blue)]">⚓</span>
          関心の3段階
        </h2>
        <p className="mt-2 text-sm text-[var(--c-text-muted)]">
          本気度に応じて段階的に意思表示、適切なマッチングを実現
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card 
          title="購入したい" 
          badge="本気度：高"
          desc="実際にお金を払う意思を表明。人数×単価の計算に反映。"
          req="※ 登録ユーザーのみ押せます" 
        />
        <Card 
          title="欲しいかも" 
          badge="本気度：中"
          desc="すぐではないが、条件次第で欲しい。潜在需要としてカウント。"
          req="※ 登録ユーザーのみ押せます" 
        />
        <Card 
          title="興味あり" 
          badge="本気度：低"
          desc="登録していなくても押せるライトな共感ボタン。登録の入口に。"
          req="※ 未登録ユーザーも押せます" 
        />
      </div>
    </section>
  );
}
