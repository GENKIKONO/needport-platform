// 'use client' は子へ。ここはサーバーで参加権限の外枠だけ確認。
import { auth } from '@clerk/nextjs/server';
import ChatClient from './ChatClient';
import Link from 'next/link';

export const dynamic = "force-dynamic";

async function fetchMeta(id: string, headers: HeadersInit) {
  try {
    // 参加者かどうかを軽く判定（RLSはAPI側で最終防御）
    const u = process.env.PLATFORM_ORIGIN!;
    const p = await fetch(`${u}/api/proposals/list?mine=1&per=1&id=${id}`, { cache: 'no-store', headers }).then(r=>r.json()).catch(()=>null);
    return p;
  } catch { return null; }
}

export default async function Page({ params }: { params: { id: string }}) {
  const { userId } = auth();
  if (!userId) {
    return (
      <div className="max-w-xl mx-auto p-6 space-y-3">
        <h1 className="text-xl font-semibold">チャット</h1>
        <p>ログインが必要です。</p>
      </div>
    );
  }

  // 軽メタ（なくてもOK）— 失敗してもクライアントでAPI叩けるので通す
  const meta = await fetchMeta(params.id, { 'x-needport-internal': '1' }).catch(()=>null);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">交渉チャット</h1>
        <Link href="/vendor/dashboard" className="text-sm text-sky-600 underline">ダッシュボードへ</Link>
      </div>
      <ChatClient proposalId={params.id} />
    </div>
  );
}
