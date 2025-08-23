'use client';
import { events } from '@/lib/events';
import { AnchorIcon } from '@heroicons/react/24/outline';
import { getDevSession } from '@/lib/devAuth';

export default function FutureBenefits() {
  const devSession = getDevSession();
  events.serviceOverview.view(devSession?.userId || 'anonymous', 'benefits');
  
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-[var(--c-blue-strong)] flex items-center gap-2 sm:gap-2 lg:gap-3">
          <AnchorIcon className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-[var(--c-blue)]" />
          NeedPortを使うと、どんな未来？
        </h2>
        <p className="mt-2 text-sm text-[var(--c-text-muted)]">
          一般ユーザーと企業ユーザーそれぞれのベネフィット
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-[var(--c-border)] bg-[var(--c-card)] p-4">
          <h3 className="font-semibold text-[var(--c-blue-strong)]">一般ユーザー</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-[var(--c-text)] space-y-1">
            <li>「欲しいけど自分ひとりじゃ動かない」が、同じ想いの人と"合流"して現実になります。</li>
            <li>投稿するだけで、仲間と企業に届く。</li>
            <li>登録すれば「購入したい／欲しいかも」で意思表示、具体化が進む。</li>
          </ul>
        </div>
        <div className="rounded-md border border-[var(--c-border)] bg-[var(--c-card)] p-4">
          <h3 className="font-semibold text-[var(--c-blue-strong)]">企業ユーザー</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-[var(--c-text)] space-y-1">
            <li>小ロットで採算が合わない案件も、共感の人数×単価が見えるから企画しやすい。</li>
            <li>無駄な見積りが減り、刺さる需要に集中できます。</li>
            <li>承認制チャットでひやかしを回避。成立時のみマッチングフィー。</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
