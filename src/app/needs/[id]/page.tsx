import { notFound } from 'next/navigation';
import { getNeedById } from '@/lib/server/needsService';
import ProposalButton from '@/components/needs/ProposalButton';
import { UnlockAccessButton } from "@/components/needs/UnlockAccessButton";
import { ContactPanel } from "./ContactPanel";
import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

interface NeedDetailPageProps {
  params: { id: string };
}

export default async function NeedDetailPage({ params }: NeedDetailPageProps) {
  const { userId } = auth();
  // データを取得
  const need = await getNeedById(params.id);

  if (!need) {
    notFound();
  }

  // 既存の need 取得ロジックの直後に、提案数を取得（公開カウント）
  const countRes = await fetch(`${process.env.PLATFORM_ORIGIN}/api/proposals/count-by-need?needId=${params.id}`, { cache: 'no-store' }).then(r => r.json()).catch(()=>({count:0}));

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{need.title}</h1>
        <div className="text-xs text-muted-foreground">
          {new Date(need.updated_at || need.created_at).toLocaleDateString()} / {need.area} / {need.category}
        </div>
      </header>

      <section className="rounded border p-4 space-y-2">
        <h2 className="font-medium">概要</h2>
        <p className="whitespace-pre-line">{need.summary}</p>
      </section>

      {need.deadline && (
        <div className="text-sm">
          <span className="px-2 py-1 rounded bg-amber-100 text-amber-800">
            期限: {new Date(need.deadline).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* 既存のヘッダー・概要ブロック等 */}
      <div className="text-sm text-gray-500">提案数: {countRes?.count ?? 0}</div>

      {/* 交渉メッセージ（提案後に使う簡易UIへの導線） */}
      <div className="rounded-md border p-4 space-y-2">
        <h2 className="font-semibold">交渉チャット</h2>
        <p className="text-sm text-muted-foreground">
          提案を送信後、相手とこの案件について1対1でメッセージできます。
        </p>
        <p className="text-xs text-gray-500">※ 提案送信後、ダッシュボードの「チャットを開く」から遷移できます。</p>
      </div>

      {/* 提案フォーム（最低限） */}
      <div className="border rounded-md p-4 space-y-2">
        <h2 className="font-semibold">提案する</h2>
        {!userId ? (
          <p className="text-sm">提案するには <Link href="/sign-in" className="text-sky-600 underline">ログイン</Link> が必要です。</p>
        ) : (
          <form id="proposal-form" className="space-y-2" onSubmit={(e)=>{}}>
            <input name="title" placeholder="件名" className="w-full border rounded px-3 py-2" required minLength={3} maxLength={160} />
            <textarea name="body" placeholder="提案内容（詳細）" className="w-full border rounded px-3 py-2" required minLength={10} maxLength={4000} rows={5}/>
            <input name="estimatePrice" type="number" min="0" placeholder="見積り金額（任意）" className="w-full border rounded px-3 py-2" />
            <button
              formAction="/api/proposals/create"
              formMethod="post"
              className="px-3 py-2 rounded bg-emerald-600 text-white"
              onClick={(e)=>{}}
              >
              提案を送信
            </button>
            <input type="hidden" name="needId" value={params.id} />
          </form>
        )}
      </div>

      <UnlockAccessButton needId={need.id}/>

      <aside className="pt-4">
        <h2 className="font-medium mb-2">関連するニーズ</h2>
        <div className="text-sm text-muted-foreground">※ 検索条件に基づき、後日実装予定</div>
      </aside>
    </div>
  );
}
