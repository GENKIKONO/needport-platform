import { currentUser } from '@clerk/nextjs/server';

export const dynamic = "force-dynamic";

async function getProfile(userId: string) {
  try {
    const res = await fetch(`${process.env.PLATFORM_ORIGIN}/api/me/vendor-profile`, { cache: 'no-store', headers: { 'x-needport-internal': '1' }});
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export default async function VendorConnectPage() {
  const user = await currentUser();
  if (!user) return <div className="p-6">ログインが必要です。</div>;

  const profile = await getProfile(user.id);
  const accountId = profile?.stripe_connect_account_id as string | undefined;
  const ready = profile?.stripe_connect_ready as boolean | undefined;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Stripe Connect 設定</h1>

      <div className="rounded-md border p-4 space-y-2">
        <div>現在の状態: {ready ? '✅ 本人確認・入金設定 完了' : accountId ? '⏳ アカウント作成済（未完了）' : '— 未作成 —'}</div>
        <div className="text-xs text-muted-foreground break-all">accountId: {accountId ?? '(なし)'}</div>

        <div className="flex gap-2 pt-2">
          {!accountId && (
            <form action="/api/connect/create-account" method="post">
              <input type="hidden" name="returnUrl" value="/vendor/connect" />
              <button className="px-3 py-2 rounded bg-blue-600 text-white">新規アカウント作成</button>
            </form>
          )}
          {accountId && !ready && (
            <form action="/api/connect/account-link" method="post">
              <input type="hidden" name="accountId" value={accountId} />
              <input type="hidden" name="returnUrl" value="/vendor/connect" />
              <button className="px-3 py-2 rounded bg-amber-600 text-white">オンボーディングを再開</button>
            </form>
          )}
        </div>

        <p className="text-sm text-muted-foreground pt-2">
          オンボーディング完了後は、Webhook（<code>account.updated</code>）で自動的に状態が更新されます。
        </p>
      </div>
    </div>
  );
}
