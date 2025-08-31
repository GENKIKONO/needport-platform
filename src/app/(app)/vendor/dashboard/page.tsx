import { currentUser } from '@clerk/nextjs/server';

async function fetchProfile() {
  const res = await fetch(`${process.env.PLATFORM_ORIGIN}/api/me/vendor-profile`, { cache: 'no-store', headers: { 'x-needport-internal': '1' } });
  if (!res.ok) return null;
  return res.json();
}
async function fetchRecent() {
  const res = await fetch(`${process.env.PLATFORM_ORIGIN}/api/settlements/list?limit=10&mine=1`, { cache: 'no-store', headers: { 'x-needport-internal': '1' } });
  if (!res.ok) return [];
  return res.json();
}
export const dynamic = 'force-dynamic';

export default async function VendorDash() {
  const user = await currentUser();
  if (!user) return <div className="p-6">ログインが必要です。</div>;
  
  // 既存：Connect状態・最近の成約...
  // 追加：自分の最近の提案
  const proposals = await fetch(`${process.env.PLATFORM_ORIGIN}/api/proposals/list?mine=1&per=5`, { cache:'no-store', headers: { 'x-needport-internal': '1' }}).then(r => r.json()).catch(()=>({rows:[]}));
  const [profile, recent] = await Promise.all([fetchProfile(), fetchRecent()]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">事業者ダッシュボード</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded border p-4">
          <div className="text-sm text-muted-foreground">口座登録</div>
          <div className="text-lg">{profile?.stripe_connect_ready ? '✅ 完了' : '⏳ 未完了'}</div>
          {!profile?.stripe_connect_ready && <a href="/vendor/connect" className="text-blue-600 underline text-sm">口座登録へ</a>}
        </div>
        <div className="rounded border p-4">
          <div className="text-sm text-muted-foreground">最近の成約</div>
          <div className="text-lg">{recent?.length ?? 0} 件</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm text-muted-foreground">決済状態</div>
          <div className="text-lg">オンライン決済：準備中</div>
        </div>
      </div>
      <section className="rounded border p-4">
        <h2 className="font-medium mb-3">最近の成約</h2>
        {(!recent || recent.length===0) ? (
          <p className="text-sm text-muted-foreground">まだ成約はありません。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr><th className="py-2 pr-4">日時</th><th className="py-2 pr-4">方法</th><th className="py-2 pr-4">売価</th><th className="py-2 pr-4">手数料</th><th className="py-2 pr-4">状態</th></tr>
              </thead>
              <tbody>
                {recent.map((r:any)=>(
                  <tr key={r.id} className="border-t">
                    <td className="py-2 pr-4">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="py-2 pr-4">{r.method}</td>
                    <td className="py-2 pr-4">{(r.final_price/1000).toFixed(0)} 千円</td>
                    <td className="py-2 pr-4">{(r.fee_amount/1000).toFixed(0)} 千円</td>
                    <td className="py-2 pr-4">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      
      <div className="rounded-md border p-4">
        <div className="font-semibold mb-2">最近の提案</div>
        <div className="text-sm text-gray-500 mb-3">{proposals.total ?? proposals.rows?.length ?? 0} 件</div>
        <div className="divide-y">
          {(proposals.rows || []).map((p: any) => (
            <div key={p.id} className="py-2">
              <div className="text-sm font-medium">{p.title}</div>
              <div className="text-xs text-gray-500">status: {p.status} / {new Date(p.created_at).toLocaleString()}</div>
            </div>
          ))}
          {!proposals.rows?.length && <div className="py-2 text-sm text-gray-500">まだ提案はありません。</div>}
        </div>
      </div>
    </div>
  );
}
