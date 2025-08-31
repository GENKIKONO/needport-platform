import { currentUser } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

async function fetchQueue() {
  try {
    const res = await fetch(`${process.env.PLATFORM_ORIGIN}/api/needs/list?status=review&per=50`, { cache: 'no-store' });
    if (!res.ok) return { rows: [], total: 0 };
    return res.json();
  } catch { return { rows: [], total: 0 }; }
}

export default async function AdminNeedsQueue() {
  const user = await currentUser();
  if (!user) return <div className="p-6">ログインが必要です。</div>;

  // 画面側でも最低限の「admin風」表示（本当の権限はAPIで判定）
  const queue = await fetchQueue();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">承認キュー（review）</h1>
      <p className="text-sm text-muted-foreground mb-2">該当件数: {queue.total}</p>
      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">タイトル</th>
              <th className="px-3 py-2">地域</th>
              <th className="px-3 py-2">カテゴリ</th>
              <th className="px-3 py-2">状態</th>
              <th className="px-3 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {queue.rows?.map((n: any) => (
              <tr key={n.id} className="border-t">
                <td className="px-3 py-2">{n.title}</td>
                <td className="px-3 py-2 text-center">{n.region}</td>
                <td className="px-3 py-2 text-center">{n.category}</td>
                <td className="px-3 py-2 text-center">{n.status}</td>
                <td className="px-3 py-2">
                  <form action="/api/needs/publish" method="post" className="inline">
                    <input type="hidden" name="id" value={n.id} />
                    <button className="px-3 py-1.5 rounded bg-emerald-600 text-white">公開にする</button>
                  </form>
                  <form action="/api/needs/review" method="post" className="inline ml-2">
                    <input type="hidden" name="id" value={n.id} />
                    <input type="hidden" name="status" value="draft" />
                    <button className="px-3 py-1.5 rounded bg-amber-600 text-white">下書きへ戻す</button>
                  </form>
                </td>
              </tr>
            ))}
            {!queue.rows?.length && (
              <tr><td className="px-3 py-6 text-center text-gray-500" colSpan={5}>承認待ちのニーズはありません。</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
