'use client';
import { events } from '@/lib/events';
import { getDevSession } from '@/lib/devAuth';

export default function KaichuLifecycle() {
  const devSession = getDevSession();
  events.serviceOverview.view(devSession?.userId || 'anonymous', 'kaichu');
  
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-[var(--c-blue-strong)]">海中（ニーズのライフサイクル）</h2>
      <div className="rounded-md border border-[var(--c-border)] bg-gradient-to-b from-[var(--c-blue-bg)] to-[var(--c-card)] p-4">
        <ul className="list-disc pl-5 text-sm text-[var(--c-text)] space-y-1">
          <li>投稿から <b>2ヶ月</b> 以内に成立しないニーズは「海中」に静かに沈みます。</li>
          <li>海中は <b>登録ユーザーのみ</b> 閲覧できます。</li>
          <li>海中で共感が集まれば <b>再浮上</b> し、再び事業者とつながるチャンスに。</li>
        </ul>
        <div className="mt-3 text-xs text-[var(--c-text-muted)]">※ 海中は「捨て場」ではなく、未来のアイデア資産です。</div>
      </div>
    </section>
  );
}
