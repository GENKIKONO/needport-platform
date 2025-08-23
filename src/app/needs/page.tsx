import { Suspense } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDevSession } from '@/lib/devAuth';
import { NeedScope } from '@/lib/needs/scope';
import NeedsTabs from '@/components/needs/NeedsTabs';
import NeedsCard from '@/components/needs/NeedsCard';
import { KaichuSkeleton } from '@/components/ui/Skeleton';

interface NeedCard {
  id: string;
  title: string;
  summary: string;
  body?: string;
  area: string;
  tags: string[];
  status: string;
  created_at: string;
  updated_at: string;
  prejoin_count: number;
}

interface NeedsPageProps {
  searchParams: {
    scope?: string;
    sort?: string;
    page?: string;
    preview?: string;
  };
}

async function getNeeds(searchParams: NeedsPageProps['searchParams']): Promise<{ needs: NeedCard[], total: number }> {
  const supabase = createAdminClient();
  
  const scope = (searchParams.scope as NeedScope) || 'active';
  const sort = searchParams.sort || 'recent';
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const offset = (page - 1) * limit;
  
  let query = supabase
    .from('needs')
    .select('id, title, summary, body, area, tags, status, created_at, updated_at, prejoin_count', { count: 'exact' });

  // スコープフィルタ適用
  if (scope === 'active') {
    query = query.eq('status', 'active');
  } else if (scope === 'kaichu') {
    const cutoffDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    query = query.or(`status.eq.archived,status.eq.closed,created_at.lte.${cutoffDate}`);
  }

  // ソート適用
  if (sort === 'most_supported') {
    query = query.order('prejoin_count', { ascending: false });
  } else if (sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else {
    query = query.order('updated_at', { ascending: false });
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching needs:', error);
    return { needs: [], total: 0 };
  }

  return { needs: data || [], total: count || 0 };
}

async function NeedsContent({ searchParams }: NeedsPageProps) {
  const { needs, total } = await getNeeds(searchParams);
  const scope = (searchParams.scope as NeedScope) || 'active';
  const sort = searchParams.sort || 'recent';
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const totalPages = Math.ceil(total / limit);
  const isPreview = searchParams.preview === 'share';

  return (
    <div>
      <NeedsTabs currentScope={scope} />
      
      {/* フィルタ・ソート */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            defaultValue={sort}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              const params = new URLSearchParams(searchParams as any);
              params.set('sort', e.target.value);
              params.set('page', '1');
              window.location.href = `/needs?${params.toString()}`;
            }}
          >
            <option value="recent">最近のアクション</option>
            <option value="most_supported">共感が多い</option>
            <option value="newest">新着</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-600">
          {total}件中 {((page - 1) * limit) + 1}-{Math.min(page * limit, total)}件
        </div>
      </div>

      {needs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">該当するニーズが見つかりませんでした</p>
          <a 
            href="/needs" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            フィルタをリセット
          </a>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {needs.map((need) => (
              <NeedsCard 
                key={need.id} 
                need={need} 
                scope={scope}
                isPreview={isPreview}
              />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                {page > 1 && (
                  <a
                    href={`/needs?${new URLSearchParams({
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
                    href={`/needs?${new URLSearchParams({
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

export default function NeedsPage(props: NeedsPageProps) {
  const devSession = getDevSession();
  const isPreview = props.searchParams.preview === 'share';
  const showFullContent = !!devSession && !isPreview;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ニーズ一覧</h1>
        <p className="text-gray-600">
          {showFullContent ? '公開中のニーズを表示しています' : 'ニーズの概要を表示しています'}
        </p>
      </div>

      <Suspense fallback={<KaichuSkeleton />}>
        <NeedsContent {...props} />
      </Suspense>
    </main>
  );
}
