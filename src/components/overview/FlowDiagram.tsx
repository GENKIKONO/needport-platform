'use client';
import { events } from '@/lib/events';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { AnchorIcon } from '@heroicons/react/24/outline';
import { getDevSession } from '@/lib/devAuth';

const Step = ({ n, title, desc }: { n: number; title: string; desc: string }) => (
  <div className="flex items-start gap-3 rounded-md bg-[var(--c-blue-bg)] p-4 shadow-sm">
    <div className="mt-1 h-6 w-6 shrink-0 rounded-full bg-[var(--c-blue)] text-white grid place-items-center text-xs">{n}</div>
    <div className="min-w-0 flex-1">
      <div className="font-semibold text-[var(--c-blue-strong)] truncate">{title}</div>
      <div className="text-sm text-[var(--c-text-muted)] line-clamp-2">{desc}</div>
    </div>
  </div>
);

export default function FlowDiagram() {
  const devSession = getDevSession();
  events.serviceOverview.view(devSession?.userId || 'anonymous', 'flow');
  
  const items = [
    ['ニーズ投稿', '欲しいもの／困りごとを投稿。概要は誰でも見られる。'],
    ['関心の表明', '購入したい／欲しいかも／興味あり で本気度を可視化。'],
    ['事業化の目安', '人数×単価で成立ラインを見える化。'],
    ['企業の提案', '条件・スケジュール・金額などを提示。'],
    ['マッチング成立', '承認制チャットで安全に詳細詰め。'],
    ['ライフサイクル', '2ヶ月で未成立なら海中へ。共感で再浮上。'],
  ];
  
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-[var(--c-blue-strong)] flex items-center gap-2 sm:gap-2 lg:gap-3">
          <AnchorIcon className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-[var(--c-blue)]" />
          ニーズ投稿から成立までの流れ
        </h2>
        <p className="mt-2 text-sm text-[var(--c-text-muted)]">
          投稿から成立まで、6つのステップで安全にマッチング
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {items.map(([title, desc], i) => (
          <Step key={i} n={i+1} title={title} desc={desc as string} />
        ))}
      </div>
      <div className="flex items-center gap-2 text-[var(--c-blue)]">
        <CheckCircleIcon className="h-5 w-5" />
        <p className="text-sm">情報は段階開示：概要（誰でも）→ 詳細（登録者）→ 成立後は関係者のみ</p>
      </div>
    </section>
  );
}
