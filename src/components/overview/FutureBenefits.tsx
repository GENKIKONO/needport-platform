'use client';
import { events } from '@/lib/events';
import { getDevSession } from '@/lib/devAuth';

export default function FutureBenefits() {
  const devSession = getDevSession();
  events.serviceOverview.view(devSession?.userId || 'anonymous', 'benefits');
  
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-[var(--c-blue-strong)]">NeedPortを使うと、どんな未来？</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-[var(--c-border)] bg-[var(--c-card)] p-4">
          <h3 className="font-semibold text-[var(--c-blue-strong)]">一般ユーザー</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-[var(--c-text)] space-y-1">
            <li>一人では実現しづらいアイデアが、共感で形になる。</li>
            <li>登録すれば「購入したい／欲しいかも」で意思表示、具体化が進む。</li>
            <li>2ヶ月で沈んでも終わりじゃない。海中で再び浮上の芽が出る。</li>
          </ul>
        </div>
        <div className="rounded-md border border-[var(--c-border)] bg-[var(--c-card)] p-4">
          <h3 className="font-semibold text-[var(--c-blue-strong)]">企業ユーザー</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-[var(--c-text)] space-y-1">
            <li>市場リサーチを短縮。実需（人数×単価）を見ながら提案できる。</li>
            <li>承認制チャットでひやかしを回避。成立時のみマッチングフィー。</li>
            <li>海中から長期ニーズを掘り起こし、タイミング良く再提案。</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
