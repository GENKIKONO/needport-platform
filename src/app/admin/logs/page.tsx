export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createAdminClient } from "@/lib/supabase/admin";
import AdminBar from "@/components/admin/AdminBar";

type AuditLog = {
  id: string;
  action: string;
  need_id: string | null;
  offer_id: string | null;
  payload: any;
  created_at: string;
};

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  try {
    const sp = await searchParams;
    const action = sp.action as string | undefined;
    const needId = sp.need_id as string | undefined;
    const page = Math.max(1, Number(sp.page) || 1);
    const limit = 50;
    const offset = (page - 1) * limit;

    const admin = createAdminClient();
    
    // Build query
    let query = admin
      .from("admin_audit_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (action) {
      query = query.eq("action", action);
    }
    if (needId) {
      query = query.eq("need_id", needId);
    }

    // Get total count
    // @ts-expect-error - Supabase type issue, will be fixed when types are updated
    const { count } = await query.select("id", { count: "exact", head: true });

    // Get paginated data
    const { data: logs, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      return (
        <div className="p-6 text-red-500">
          読み込みに失敗しました。
          <pre className="whitespace-pre-wrap text-xs mt-2">{error.message}</pre>
        </div>
      );
    }

    const logsList: AuditLog[] = logs || [];
    const totalPages = Math.ceil((count || 0) / limit);

    const getPageUrl = (newPage: number) => {
      const params = new URLSearchParams();
      if (action) params.set("action", action);
      if (needId) params.set("need_id", needId);
      params.set("page", String(newPage));
      return `?${params.toString()}`;
    };

    const getActionLabel = (action: string) => {
      const labels: Record<string, string> = {
        'offer.add': 'オファー追加',
        'offer.edit': 'オファー編集',
        'offer.delete': 'オファー削除',
        'offer.adopt': 'オファー採用',
        'offer.unadopt': 'オファー採用解除',
      };
      return labels[action] || action;
    };

    return (
      <div className="space-y-6">
        <AdminBar title="監査ログ" />
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-6">監査ログ</h1>

          {/* Filters */}
          <div className="mb-6">
            <form method="GET" className="flex gap-4">
              <div>
                <label className="block text-sm mb-1">アクション</label>
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
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">ニーズID</label>
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
                  className="rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-3 py-2 text-sm text-emerald-200 hover:bg-emerald-600/30"
                >
                  フィルター
                </button>
              </div>
            </form>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3">日時</th>
                  <th className="text-left p-3">アクション</th>
                  <th className="text-left p-3">ニーズID</th>
                  <th className="text-left p-3">オファーID</th>
                  <th className="text-left p-3">詳細</th>
                </tr>
              </thead>
              <tbody>
                {logsList.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3 text-gray-400">
                      {new Date(log.created_at).toLocaleString("ja-JP")}
                    </td>
                    <td className="p-3">
                      <span className="rounded-md bg-blue-600/20 px-2 py-1 text-xs text-blue-300">
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300">
                      {log.need_id ? (
                        <a href={`/admin/needs/${log.need_id}/offers`} className="text-emerald-400 hover:underline">
                          {log.need_id.slice(0, 8)}...
                        </a>
                      ) : "-"}
                    </td>
                    <td className="p-3 text-gray-300">
                      {log.offer_id ? log.offer_id.slice(0, 8) + "..." : "-"}
                    </td>
                    <td className="p-3 text-gray-400">
                      {log.payload ? (
                        <details className="text-xs">
                          <summary className="cursor-pointer hover:text-gray-300">詳細</summary>
                          <pre className="mt-1 whitespace-pre-wrap bg-gray-800 p-2 rounded">
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        </details>
                      ) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {page > 1 && (
                <a
                  href={getPageUrl(page - 1)}
                  className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
                >
                  前へ
                </a>
              )}
              <span className="text-sm text-gray-400">
                ページ {page} / {totalPages}
              </span>
              {page < totalPages && (
                <a
                  href={getPageUrl(page + 1)}
                  className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
                >
                  次へ
                </a>
              )}
            </div>
          )}

          {logsList.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              ログがありません。
            </div>
          )}
        </div>
      </div>
    );
  } catch (e: any) {
    return (
      <div className="p-6 text-red-500">
        予期せぬエラーが発生しました。
        <pre className="whitespace-pre-wrap text-xs mt-2">{e?.message ?? String(e)}</pre>
      </div>
    );
  }
}
