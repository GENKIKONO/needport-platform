import { supabaseServer } from '@/lib/server/supabase';
import AdminBar from '@/components/admin/AdminBar';

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const action = sp.action as string | undefined;
  const needId = sp.need_id as string | undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const per = Math.min(100, Math.max(1, Number(sp.per) || 20));
  const offset = (page - 1) * per;

  const supabase = supabaseServer();
  
  // Build query
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('at', { ascending: false });

  if (action) {
    // @ts-expect-error - Supabase type issue
    query = query.eq('action', action);
  }
  if (needId) {
    query = query.eq('need_id', needId);
  }

  // Get total count
  // @ts-expect-error - Supabase type issue, will be fixed when types are updated
  const { count } = await query.select('id', { count: 'exact', head: true });

  // Get paginated data
  const { data: logs, error } = await query
    .range(offset, offset + per - 1);

  if (error) {
    console.error('[audit] error:', error);
    return (
      <div className="p-6 text-red-500">
        取得に失敗しました。<pre className="whitespace-pre-wrap text-xs mt-2">{error.message}</pre>
      </div>
    );
  }

  const totalPages = Math.ceil((count || 0) / per);

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'offer.add': 'オファー追加',
      'offer.edit': 'オファー編集',
      'offer.delete': 'オファー削除',
      'offer.adopt': 'オファー採用',
      'offer.unadopt': 'オファー採用解除',
      'status.change': 'ステータス変更',
      'settings.save': '設定保存',
      'need.create': 'ニーズ作成',
      'need.update': 'ニーズ更新',
      'need.delete': 'ニーズ削除',
      'attachment.upload': '添付ファイルアップロード',
      'attachment.delete': '添付ファイル削除',
      'note.add': 'メモ追加',
      'import.csv': 'CSVインポート'
    };
    return labels[action] || action;
  };

  return (
    <div className="space-y-6">
      <AdminBar title="監査ログ" />
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-6">監査ログ</h1>
        
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <form method="GET" className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">アクション</label>
              <select
                name="action"
                defaultValue={action}
                className="rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ring-white/10"
              >
                <option value="">すべて</option>
                <option value="offer.add">オファー追加</option>
                <option value="offer.edit">オファー編集</option>
                <option value="offer.delete">オファー削除</option>
                <option value="offer.adopt">オファー採用</option>
                <option value="offer.unadopt">オファー採用解除</option>
                <option value="status.change">ステータス変更</option>
                <option value="settings.save">設定保存</option>
                <option value="need.create">ニーズ作成</option>
                <option value="need.update">ニーズ更新</option>
                <option value="need.delete">ニーズ削除</option>
                <option value="attachment.upload">添付ファイルアップロード</option>
                <option value="attachment.delete">添付ファイル削除</option>
                <option value="note.add">メモ追加</option>
                <option value="import.csv">CSVインポート</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ニーズID</label>
              <input
                type="text"
                name="need_id"
                defaultValue={needId}
                placeholder="UUID"
                className="rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ring-white/10"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                フィルター
              </button>
            </div>
          </form>
        </div>

        {/* Logs table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-3">日時</th>
                <th className="text-left p-3">アクター</th>
                <th className="text-left p-3">アクション</th>
                <th className="text-left p-3">ニーズID</th>
                <th className="text-left p-3">参照ID</th>
                <th className="text-left p-3">メタデータ</th>
              </tr>
            </thead>
            <tbody>
              {(logs || []).map((log) => (
                <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-3 text-sm">
                    {new Date(log.at).toLocaleString('ja-JP')}
                  </td>
                  <td className="p-3 text-sm">{log.actor}</td>
                  <td className="p-3 text-sm">
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                      {getActionLabel(log.action)}
                    </span>
                  </td>
                  <td className="p-3 text-sm font-mono">
                    {log.need_id ? (
                      <a
                        href={`/admin/needs/${log.need_id}/offers`}
                        className="text-emerald-400 hover:text-emerald-300 underline"
                      >
                        {log.need_id.slice(0, 8)}...
                      </a>
                    ) : '-'}
                  </td>
                  <td className="p-3 text-sm font-mono">
                    {log.ref_id || '-'}
                  </td>
                  <td className="p-3 text-sm">
                    {log.meta ? (
                      <details className="cursor-pointer">
                        <summary className="text-xs text-gray-400">詳細</summary>
                        <pre className="text-xs mt-1 bg-gray-800 p-2 rounded overflow-auto">
                          {log.meta}
                        </pre>
                      </details>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            {page > 1 && (
              <a
                href={`?${new URLSearchParams({
                  ...(action && { action }),
                  ...(needId && { need_id: needId }),
                  page: String(page - 1),
                  per: String(per)
                })}`}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
              >
                前へ
              </a>
            )}
            <span className="text-sm text-gray-400">
              ページ {page} / {totalPages}
            </span>
            {page < totalPages && (
              <a
                href={`?${new URLSearchParams({
                  ...(action && { action }),
                  ...(needId && { need_id: needId }),
                  page: String(page + 1),
                  per: String(per)
                })}`}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
              >
                次へ
              </a>
            )}
          </div>
        )}

        {logs?.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            ログがありません
          </div>
        )}
      </div>
    </div>
  );
}
