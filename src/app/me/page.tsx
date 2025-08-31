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

  // 通知一覧を取得
  const notifications = await fetchJSON('/api/notifications/list?limit=10');
  const rows = notifications?.rows || [];
  const unread = rows.filter((r:any)=>!r.read).length;
  const prefsRes = await fetch(`${process.env.PLATFORM_ORIGIN}/api/notifications/prefs`, { headers:{ 'x-needport-internal':'1' }, cache:'no-store' }).catch(()=>null);
  const prefs = prefsRes && prefsRes.ok ? await prefsRes.json() : { email_on_message:true, email_on_proposal:true, email_on_settlement:true };

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

      <section className="rounded border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">通知</h2>
          <span className="text-xs text-muted-foreground">{unread} 未読</span>
        </div>
        <ul className="mt-2 space-y-2">
          {rows.map((n:any)=>(
            <li key={n.id} className="text-sm">
              <div className="font-medium">{n.title}</div>
              {n.body && <div className="text-muted-foreground">{n.body}</div>}
            </li>
          ))}
        </ul>
        <div className="text-right mt-2">
          <Link className="text-blue-600 underline text-sm" href="/vendor/dashboard">提案一覧へ</Link>
        </div>
      </section>

      <section className="rounded border p-4">
        <h2 className="font-medium">通知設定（メール）</h2>
        <form action="/api/notifications/prefs" method="post" onSubmit={(e)=>{}}>
          <input type="hidden" name="_method" value="PUT" />
          <div className="mt-2 space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input name="email_on_message" type="checkbox" defaultChecked={!!prefs.email_on_message} /> メッセージ受信
            </label>
            <label className="flex items-center gap-2">
              <input name="email_on_proposal" type="checkbox" defaultChecked={!!prefs.email_on_proposal} /> 提案の更新
            </label>
            <label className="flex items-center gap-2">
              <input name="email_on_settlement" type="checkbox" defaultChecked={!!prefs.email_on_settlement} /> 入金/成約
            </label>
          </div>
          <button className="mt-3 rounded bg-blue-600 px-3 py-1.5 text-white text-sm"
            onClick={async (ev:any)=> {
              ev.preventDefault();
              const form = ev.currentTarget.form as HTMLFormElement;
              const body = {
                email_on_message: (form.email_on_message as any)?.checked || false,
                email_on_proposal: (form.email_on_proposal as any)?.checked || false,
                email_on_settlement: (form.email_on_settlement as any)?.checked || false,
              };
              await fetch('/api/notifications/prefs', { method:'PUT', headers:{'content-type':'application/json'}, body: JSON.stringify(body) });
              location.reload();
            }}>保存</button>
        </form>
      </section>
    </div>
  );
}
