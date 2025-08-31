import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';

async function fetchSettlements() {
  const res = await fetch(`${process.env.PLATFORM_ORIGIN}/api/settlements/list`, { cache: 'no-store', headers: { 'x-needport-internal': '1' }});
  if (!res.ok) return [];
  return res.json();
}

export const dynamic = 'force-dynamic';

export default async function AdminSettlementsPage() {
  const user = await currentUser();
  if (!user) return <div className="p-6">ログインが必要です。</div>;

  const data = await fetchSettlements();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">成約一覧（運用）</h1>
      <p className="text-sm text-muted-foreground">銀行振込の入金確認後に「入金済みにする」を押してください。</p>
      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="p-2 text-left">日時</th>
              <th className="p-2 text-left">Need</th>
              <th className="p-2 text-left">Vendor</th>
              <th className="p-2 text-right">売価</th>
              <th className="p-2 text-right">手数料</th>
              <th className="p-2 text-left">方法</th>
              <th className="p-2 text-left">状態</th>
              <th className="p-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row: any) => (
              <tr key={row.id} className="border-t">
                <td className="p-2">{new Date(row.created_at).toLocaleString()}</td>
                <td className="p-2">
                  <Link href={`/needs/${row.need_id}`} className="text-blue-600 underline">詳細</Link>
                </td>
                <td className="p-2">{row.vendor_id}</td>
                <td className="p-2 text-right">{(row.final_price/1000).toLocaleString()} 千円</td>
                <td className="p-2 text-right">{(row.fee_amount/1000).toLocaleString()} 千円</td>
                <td className="p-2">{row.method}</td>
                <td className="p-2">{row.status}</td>
                <td className="p-2 text-center">
                  {row.method === 'bank_transfer' && row.status !== 'paid' ? (
                    <form action="/api/settlements/mark-paid" method="post">
                      <input type="hidden" name="id" value={row.id} />
                      <button className="px-2 py-1 rounded bg-emerald-600 text-white text-xs">入金済みにする</button>
                    </form>
                  ) : <span className="text-muted-foreground">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
