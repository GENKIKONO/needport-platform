import { createAdminClient } from '@/lib/supabase/admin';
import { getDevSession } from '@/lib/devAuth';
import { redirect } from 'next/navigation';

interface Event {
  id: string;
  actor: string;
  type: string;
  payload?: any;
  created_at: string;
}

interface EventsPageProps {
  searchParams: {
    actor?: string;
    type?: string;
    page?: string;
  };
}

async function getEvents(searchParams: EventsPageProps['searchParams']): Promise<{ events: Event[], total: number }> {
  const supabase = createAdminClient();
  
  const page = parseInt(searchParams.page || '1');
  const limit = 200; // 最大200件
  const offset = (page - 1) * limit;
  
  let query = supabase
    .from('events')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  // フィルタ適用
  if (searchParams.actor) {
    query = query.ilike('actor', `%${searchParams.actor}%`);
  }

  if (searchParams.type) {
    query = query.eq('type', searchParams.type);
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching events:', error);
    return { events: [], total: 0 };
  }

  return { events: data || [], total: count || 0 };
}

function formatEventType(type: string): string {
  const typeMap: Record<string, string> = {
    'need.view': 'ニーズ閲覧',
    'kaichu.filter': '海中フィルタ',
    'match.mark_paid_manual': '手動支払い',
    'room.message': 'ルームメッセージ',
    'need.continue': 'ニーズ継続',
    'need.close': 'ニーズ完了'
  };
  
  return typeMap[type] || type;
}

function formatPayload(payload: any): string {
  if (!payload) return '';
  
  if (typeof payload === 'object') {
    return Object.entries(payload)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }
  
  return String(payload);
}

export default async function EventsPage(props: EventsPageProps) {
  const devSession = getDevSession();
  if (!devSession || devSession.role !== 'admin') {
    redirect('/admin/login');
  }

  const { events, total } = await getEvents(props.searchParams);
  const page = parseInt(props.searchParams.page || '1');
  const totalPages = Math.ceil(total / 200);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">イベントログ</h1>
        <p className="text-gray-600">
          ユーザー行動の詳細ログを表示しています（最新{total}件）
        </p>
      </div>

      {/* フィルタ */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <form method="GET" className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">アクター</label>
            <input
              type="text"
              name="actor"
              defaultValue={props.searchParams.actor}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ユーザーID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">イベントタイプ</label>
            <select
              name="type"
              defaultValue={props.searchParams.type}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">すべて</option>
              <option value="need.view">ニーズ閲覧</option>
              <option value="kaichu.filter">海中フィルタ</option>
              <option value="match.mark_paid_manual">手動支払い</option>
              <option value="room.message">ルームメッセージ</option>
              <option value="need.continue">ニーズ継続</option>
              <option value="need.close">ニーズ完了</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              検索
            </button>
          </div>

          <div className="flex items-end">
            <a
              href="/admin/events"
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-center"
            >
              リセット
            </a>
          </div>
        </form>
      </div>

      {/* イベント一覧 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクター
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  イベント
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  詳細
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(event.created_at).toLocaleString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {event.actor}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {formatEventType(event.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {event.payload && (
                      <div className="text-xs text-gray-600 max-w-xs truncate">
                        {formatPayload(event.payload)}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">該当するイベントが見つかりませんでした</p>
          </div>
        )}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2">
            {page > 1 && (
              <a
                href={`/admin/events?${new URLSearchParams({
                  ...props.searchParams,
                  page: (page - 1).toString()
                })}`}
                className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                前へ
              </a>
            )}
            
            <span className="px-3 py-2 text-gray-600">
              {page} / {totalPages}
            </span>
            
            {page < totalPages && (
              <a
                href={`/admin/events?${new URLSearchParams({
                  ...props.searchParams,
                  page: (page + 1).toString()
                })}`}
                className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                次へ
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
