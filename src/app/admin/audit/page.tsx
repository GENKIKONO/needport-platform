import { createAdminClient } from '@/lib/supabase/admin';
import { getDevSession } from '@/lib/devAuth';
import { redirect } from 'next/navigation';

interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target?: string;
  metadata?: any;
  created_at: string;
}

interface AuditPageProps {
  searchParams: {
    actor?: string;
    action?: string;
    start_date?: string;
    end_date?: string;
    page?: string;
  };
}

async function getAuditLogs(searchParams: AuditPageProps['searchParams']): Promise<{ logs: AuditLog[], total: number }> {
  const supabase = createAdminClient();
  
  const page = parseInt(searchParams.page || '1');
  const limit = 50;
  const offset = (page - 1) * limit;
  
  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  // フィルタ適用
  if (searchParams.actor) {
    query = query.ilike('actor', `%${searchParams.actor}%`);
  }

  if (searchParams.action) {
    query = query.eq('action', searchParams.action);
  }

  if (searchParams.start_date) {
    query = query.gte('created_at', searchParams.start_date);
  }

  if (searchParams.end_date) {
    query = query.lte('created_at', searchParams.end_date + 'T23:59:59');
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching audit logs:', error);
    return { logs: [], total: 0 };
  }

  return { logs: data || [], total: count || 0 };
}

function formatAction(action: string): string {
  const actionMap: Record<string, string> = {
    'message.create': 'メッセージ作成',
    'match.mark_paid_manual': '手動支払い',
    'need.continue': 'ニーズ継続',
    'need.close': 'ニーズ完了',
    'need.view': 'ニーズ閲覧',
    'kaichu.filter': '海中フィルタ',
    'room.message': 'ルームメッセージ'
  };
  
  return actionMap[action] || action;
}

function formatMetadata(metadata: any): string {
  if (!metadata) return '';
  
  if (typeof metadata === 'object') {
    return Object.entries(metadata)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }
  
  return String(metadata);
}

export default async function AuditPage(props: AuditPageProps) {
  const devSession = getDevSession();
  if (!devSession || devSession.role !== 'admin') {
    redirect('/admin/login');
  }

  const { logs, total } = await getAuditLogs(props.searchParams);
  const page = parseInt(props.searchParams.page || '1');
  const totalPages = Math.ceil(total / 50);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">監査ログ</h1>
        <p className="text-gray-600">
          システム内の操作履歴を表示しています（{total}件）
        </p>
      </div>

      {/* フィルタ */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <form method="GET" className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">アクション</label>
            <select
              name="action"
              defaultValue={props.searchParams.action}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">すべて</option>
              <option value="message.create">メッセージ作成</option>
              <option value="match.mark_paid_manual">手動支払い</option>
              <option value="need.continue">ニーズ継続</option>
              <option value="need.close">ニーズ完了</option>
              <option value="need.view">ニーズ閲覧</option>
              <option value="kaichu.filter">海中フィルタ</option>
              <option value="room.message">ルームメッセージ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
            <input
              type="date"
              name="start_date"
              defaultValue={props.searchParams.start_date}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
            <input
              type="date"
              name="end_date"
              defaultValue={props.searchParams.end_date}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              検索
            </button>
          </div>
        </form>
      </div>

      {/* ログ一覧 */}
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
                  アクション
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ターゲット
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  詳細
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(log.created_at).toLocaleString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {log.actor}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {formatAction(log.action)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.target && (
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {log.target}
                      </code>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {log.metadata && (
                      <div className="text-xs text-gray-600 max-w-xs truncate">
                        {formatMetadata(log.metadata)}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">該当するログが見つかりませんでした</p>
          </div>
        )}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2">
            {page > 1 && (
              <a
                href={`/admin/audit?${new URLSearchParams({
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
                href={`/admin/audit?${new URLSearchParams({
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
