import { supabaseServer } from '@/lib/server/supabase';
import AdminBar from '@/components/admin/AdminBar';
import Link from 'next/link';

export default async function AdminNeedsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = sp.q as string | undefined;
  const status = sp.status as string | undefined;
  const tag = sp.tag as string | undefined;
  const from = sp.from as string | undefined;
  const to = sp.to as string | undefined;
  const cursor = sp.cursor as string | undefined;
  const limit = 50;

  const supabase = supabaseServer();
  
  // Build query
  let query = supabase
    .from('needs')
    .select(`
      id,
      title,
      summary,
      status,
      prejoin_count,
      created_at,
      tags
    `)
    .order('created_at', { ascending: false })
    .limit(limit + 1); // +1 to check if there are more

  // Apply filters
  if (q?.trim()) {
    query = query.or(`title.ilike.%${q.trim()}%,summary.ilike.%${q.trim()}%`);
  }

  if (status && ['draft', 'pending', 'published', 'archived'].includes(status)) {
    query = query.eq('status', status);
  }

  if (tag?.trim()) {
    query = query.contains('tags', [tag.trim()]);
  }

  if (from) {
    query = query.gte('created_at', from);
  }

  if (to) {
    query = query.lte('created_at', to);
  }

  // Apply cursor pagination
  if (cursor) {
    const [timestamp, id] = cursor.split('|');
    query = query.or(`created_at.lt.${timestamp},and(created_at.eq.${timestamp},id.lt.${id})`);
  }

  const { data: needs, error } = await query;

  if (error) {
    console.error('[admin-needs] error:', error);
    return (
      <div className="p-6 text-red-500">
        取得に失敗しました。<pre className="whitespace-pre-wrap text-xs mt-2">{error.message}</pre>
      </div>
    );
  }

  const hasMore = needs && needs.length > limit;
  const displayNeeds = needs?.slice(0, limit) || [];
  const nextCursor = hasMore && displayNeeds.length > 0 
    ? `${displayNeeds[displayNeeds.length - 1].created_at}|${displayNeeds[displayNeeds.length - 1].id}`
    : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-600';
      case 'pending': return 'bg-yellow-600';
      case 'published': return 'bg-green-600';
      case 'archived': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return '下書き';
      case 'pending': return '承認待ち';
      case 'published': return '公開中';
      case 'archived': return 'アーカイブ';
      default: return status;
    }
  };

  const buildFilterUrl = (newParams: Record<string, string>) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    if (tag) params.set('tag', tag);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    
    // Add new params
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    return `?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <AdminBar title="ニーズ一覧" />
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-6">ニーズ一覧</h1>
        
        {/* Filters */}
        <div className="mb-6 bg-zinc-800 rounded-lg p-4">
          <form method="GET" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">検索</label>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="タイトル・概要で検索..."
                className="w-full rounded-lg bg-zinc-700 px-3 py-2 outline-none ring-1 ring-white/10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">ステータス</label>
              <select
                name="status"
                defaultValue={status}
                className="w-full rounded-lg bg-zinc-700 px-3 py-2 outline-none ring-1 ring-white/10"
              >
                <option value="">すべて</option>
                <option value="draft">下書き</option>
                <option value="pending">承認待ち</option>
                <option value="published">公開中</option>
                <option value="archived">アーカイブ</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">タグ</label>
              <input
                type="text"
                name="tag"
                defaultValue={tag}
                placeholder="タグで絞り込み..."
                className="w-full rounded-lg bg-zinc-700 px-3 py-2 outline-none ring-1 ring-white/10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">開始日</label>
              <input
                type="date"
                name="from"
                defaultValue={from}
                className="w-full rounded-lg bg-zinc-700 px-3 py-2 outline-none ring-1 ring-white/10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">終了日</label>
              <input
                type="date"
                name="to"
                defaultValue={to}
                className="w-full rounded-lg bg-zinc-700 px-3 py-2 outline-none ring-1 ring-white/10"
              />
            </div>
            
            <div className="md:col-span-2 lg:col-span-5 flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                フィルター
              </button>
              <a
                href="/admin/needs"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                クリア
              </a>
            </div>
          </form>
        </div>

        {/* Results table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-3">タイトル</th>
                <th className="text-left p-3">ステータス</th>
                <th className="text-left p-3">参加者</th>
                <th className="text-left p-3">作成日</th>
                <th className="text-left p-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {displayNeeds.map((need) => (
                <tr key={need.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-3">
                    <div className="max-w-md">
                      <div className="font-medium truncate">{need.title}</div>
                      <div className="text-sm text-gray-400 truncate">{need.summary}</div>
                      {need.tags && need.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {need.tags.slice(0, 3).map((tag: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-gray-700 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {need.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                              +{need.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(need.status)}`}>
                      {getStatusLabel(need.status)}
                    </span>
                  </td>
                  <td className="p-3">
                    {need.prejoin_count || 0}人
                  </td>
                  <td className="p-3 text-sm">
                    {new Date(need.created_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/needs/${need.id}/offers`}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        オファー
                      </Link>
                      <Link
                        href={`/admin/needs/${need.id}/summary`}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        サマリー
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 mt-6">
          {cursor && (
            <a
              href={buildFilterUrl({})}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
            >
              最初へ
            </a>
          )}
          {nextCursor && (
            <a
              href={buildFilterUrl({ cursor: nextCursor })}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
            >
              次へ
            </a>
          )}
        </div>

        {displayNeeds.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            条件に一致するニーズがありません
          </div>
        )}
      </div>
    </div>
  );
}
