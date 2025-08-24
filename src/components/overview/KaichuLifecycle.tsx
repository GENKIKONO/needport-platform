'use client';

import { AnchorIcon } from '@/components/icons';

export default function KaichuLifecycle() {
  // イベント追跡は一時的に無効化
  
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-[var(--c-blue-strong)] flex items-center gap-2 sm:gap-2 lg:gap-3">
          <AnchorIcon className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-blue-600" />
          海中（ニーズのライフサイクル）
        </h2>
        <p className="mt-2 text-sm text-[var(--c-text-muted)]">
          2ヶ月で沈む仕組みと、共感による再浮上の可能性
        </p>
      </div>
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
