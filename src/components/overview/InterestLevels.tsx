'use client';
import { events } from '@/lib/events';
import { getDevSession } from '@/lib/devAuth';

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
  const devSession = getDevSession();
  events.serviceOverview.view(devSession?.userId || 'anonymous', 'interest');
  
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-[var(--c-blue-strong)]">関心の3段階</h2>
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
