import React from 'react';
import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';

export const dynamic = "force-dynamic";

export default async function MePage() {
  const user = await currentUser();
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-3">
        <h1 className="text-xl font-semibold">マイページ</h1>
        <p>ログインしてください。</p>
        <Link className="text-blue-600 underline" href="/sign-in">ログインへ</Link>
      </div>
    );
  }

  // サーバ側で最小必要情報だけ取得
  const base = process.env.PLATFORM_ORIGIN ?? '';
  async function fetchJSON(path: string) {
    try {
      const r = await fetch(`${base}${path}`, { cache: 'no-store', headers: { 'x-needport-internal':'1' }});
      if (!r.ok) return null; return r.json();
    } catch { return null; }
  }
  const ready = await fetchJSON('/api/ready');
  const connect = await fetchJSON('/api/me/vendor-profile'); // { stripe_connect_account_id, stripe_connect_ready }

  const stripeOn = !!(ready?.checks?.stripe);
  const connectId = connect?.stripe_connect_account_id as string|undefined;
  const connectReady = !!connect?.stripe_connect_ready;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">マイページ</h1>
        <div className="text-sm text-muted-foreground mt-1">ようこそ、{user.firstName ?? user.username ?? user.id} さん</div>
      </header>

      <section className="rounded border p-4 space-y-2">
        <h2 className="font-medium">購読・支払い</h2>
        {stripeOn ? (
          <div className="flex gap-2">
            <form action="/api/billing/portal" method="post">
              <button className="px-3 py-2 rounded bg-blue-600 text-white">Billing Portal を開く</button>
            </form>
            <Link href="/history" className="px-3 py-2 rounded border">決済履歴（準備中）</Link>
          </div>
        ) : (
          <p className="text-sm text-amber-700">オンライン決済は準備中です（銀行振込で運用中）。</p>
        )}
      </section>

      <section className="rounded border p-4 space-y-2">
        <h2 className="font-medium">事業者設定（Stripe Connect）</h2>
        <div className="text-sm">状態: {connectReady ? '✅ 完了' : connectId ? '⏳ 未完了' : '— 未作成 —'}</div>
        <div className="flex gap-2">
          {!connectId && (
            <form action="/api/connect/create-account" method="post">
              <input type="hidden" name="returnUrl" value="/vendor/connect" />
              <button className="px-3 py-2 rounded border">新規アカウント作成</button>
            </form>
          )}
          {connectId && !connectReady && (
            <form action="/api/connect/account-link" method="post">
              <input type="hidden" name="accountId" value={connectId} />
              <input type="hidden" name="returnUrl" value="/vendor/connect" />
              <button className="px-3 py-2 rounded border">オンボーディングを再開</button>
            </form>
          )}
          <Link href="/vendor/dashboard" className="px-3 py-2 rounded border">事業者ダッシュボードへ</Link>
        </div>
      </section>

      <section className="rounded border p-4 space-y-2">
        <h2 className="font-medium">通知設定（ダミー）</h2>
        <p className="text-sm text-muted-foreground">提案受信・解放完了時にメール通知（後日ON）。</p>
      </section>
    </div>
  );
}
