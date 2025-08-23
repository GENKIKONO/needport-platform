import { Suspense } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDevSession } from '@/lib/devAuth';
import { KaichuSkeleton } from '@/components/ui/Skeleton';
import { TrackListContext } from '@/components/nav/ReturnBar';

interface NeedCard {
  id: string;
  title: string;
  summary: string;
  area?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  status: string;
  prejoin_count: number;
}

interface KaichuPageProps {
  searchParams: {
    area?: string;
    category?: string;
    period?: string;
    sort?: string;
    page?: string;
    limit?: string;
  };
}

async function getKaichuNeeds(searchParams: KaichuPageProps['searchParams']): Promise<{ needs: NeedCard[], total: number }> {
  const supabase = createAdminClient();
  
  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '20');
  const offset = (page - 1) * limit;
  
  let query = supabase
    .from('needs')
    .select('id, title, summary, area, tags, created_at, updated_at, status, prejoin_count', { count: 'exact' })
    .or('status.eq.archived,status.eq.closed,created_at.lte.' + new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString());

  // フィルタ適用
  if (searchParams.area) {
    query = query.eq('area', searchParams.area);
  }

  if (searchParams.period) {
    const days = parseInt(searchParams.period);
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    query = query.lte('created_at', cutoffDate);
  }

  // ソート適用
  if (searchParams.sort === 'recent') {
    query = query.order('updated_at', { ascending: false });
  } else if (searchParams.sort === 'supporters') {
    query = query.order('prejoin_count', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching kaichu needs:', error);
    return { needs: [], total: 0 };
  }

  return { needs: data || [], total: count || 0 };
}

function NeedCard({ need }: { need: NeedCard }) {
  const devSession = getDevSession();
  const isOwner = devSession?.userId === need.created_by;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {need.title}
        </h3>
        <span className={`px-2 py-1 text-xs rounded-full ${
          need.status === 'archived' ? 'bg-gray-100 text-gray-600' :
          need.status === 'closed' ? 'bg-red-100 text-red-600' :
          'bg-yellow-100 text-yellow-600'
        }`}>
          {need.status === 'archived' ? '保管中' :
           need.status === 'closed' ? '完了' : '長期化'}
        </span>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3">
        {need.summary}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          {need.area && (
            <span>📍 {need.area}</span>
          )}
          <span>❤️ {need.prejoin_count}人</span>
        </div>
        <span>更新: {new Date(need.updated_at).toLocaleDateString('ja-JP')}</span>
      </div>

      {need.tags && need.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {need.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {devSession && (
        <div className="flex gap-2">
          {isOwner ? (
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              継続する
            </button>
          ) : (
            <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">
              再浮上リクエスト
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function KaichuFilters({ searchParams }: { searchParams: KaichuPageProps['searchParams'] }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">エリア</label>
          <select 
            name="area" 
            defaultValue={searchParams.area}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">すべて</option>
            <option value="東京">東京</option>
            <option value="大阪">大阪</option>
            <option value="名古屋">名古屋</option>
            <option value="福岡">福岡</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">期間</label>
          <select 
            name="period" 
            defaultValue={searchParams.period}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">すべて</option>
            <option value="60">60日以上</option>
            <option value="90">90日以上</option>
            <option value="180">180日以上</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">並び順</label>
          <select 
            name="sort" 
            defaultValue={searchParams.sort}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">最近アクション</option>
            <option value="supporters">共感数</option>
            <option value="created">投稿日時</option>
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
      </div>
    </div>
  );
}

async function KaichuContent({ searchParams }: KaichuPageProps) {
  const { needs, total } = await getKaichuNeeds(searchParams);
  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '20');
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <form method="GET">
        <KaichuFilters searchParams={searchParams} />
      </form>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">海中のニーズ</h2>
        <p className="text-gray-600">
          長期化・保管中のニーズを表示しています（{total}件中 {((page - 1) * limit) + 1}-{Math.min(page * limit, total)}件）
        </p>
      </div>

      {needs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">該当するニーズが見つかりませんでした</p>
          <a 
            href="/kaichu" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            フィルタをリセット
          </a>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {needs.map((need) => (
              <NeedCard key={need.id} need={need} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                {page > 1 && (
                  <a
                    href={`/kaichu?${new URLSearchParams({
                      ...searchParams,
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
                    href={`/kaichu?${new URLSearchParams({
                      ...searchParams,
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
        </>
      )}
    </div>
  );
}

export default function KaichuPage(props: KaichuPageProps) {
  return (
    <>
      <TrackListContext />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">海中</h1>
          <p className="text-gray-600">
            長期・保管ニーズの専用ページです。アクティブでないニーズを検索・管理できます。
          </p>
        </div>

        <Suspense fallback={<KaichuSkeleton />}>
          <KaichuContent {...props} />
        </Suspense>
      </div>
    </>
  );
}
