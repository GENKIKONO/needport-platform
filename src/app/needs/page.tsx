import { Suspense } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDevSession } from '@/lib/devAuth';
import { NeedScope } from '@/lib/needs/scope';
import NeedsTabs from '@/components/needs/NeedsTabs';
import NeedsCard from '@/components/needs/NeedsCard';
import { KaichuSkeleton } from '@/components/ui/Skeleton';
import { u } from '@/components/ui/u';
import Empty from '@/components/ui/Empty';
import { TrackListContext } from '@/components/nav/ReturnBar';

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
  try {
    const supabase = createAdminClient();
    
    // 安全なパラメータパース（フォールバック固定）
    const scope = ['active', 'kaichu', 'all'].includes(searchParams.scope || '') 
      ? (searchParams.scope as NeedScope) 
      : 'active';
    const sort = ['recent', 'most_supported', 'newest'].includes(searchParams.sort || '') 
      ? searchParams.sort 
      : 'recent';
    const page = Number.isFinite(Number(searchParams.page)) 
      ? Math.max(1, Number(searchParams.page)) 
      : 1;
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
  } catch (error) {
    console.error('Error in getNeeds:', error);
    return { needs: [], total: 0 };
  }
}

async function NeedsContent({ searchParams }: NeedsPageProps) {
  const { needs, total } = await getNeeds(searchParams);
  
  // 安全なパラメータパース
  const scope = ['active', 'kaichu', 'all'].includes(searchParams.scope || '') 
    ? (searchParams.scope as NeedScope) 
    : 'active';
  const sort = searchParams.sort || 'recent';
  const page = Number.isFinite(Number(searchParams.page)) 
    ? Math.max(1, Number(searchParams.page)) 
    : 1;
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
            className={`px-3 py-2 border border-[var(--c-border)] rounded-md ${u.focus}`}
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
        
        <div className="text-sm text-[var(--c-text-muted)]">
          {total}件中 {((page - 1) * limit) + 1}-{Math.min(page * limit, total)}件
        </div>
      </div>

      {needs.length === 0 ? (
        <Empty 
          title="該当するニーズが見つかりません"
          desc="条件を調整してください"
          action={
            <a 
              href="/needs" 
              className={`${u.btn} ${u.btnPrimary} ${u.focus}`}
            >
              フィルタをリセット
            </a>
          }
        />
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
                    className={`${u.btn} ${u.btnGhost} ${u.focus}`}
                  >
                    前へ
                  </a>
                )}
                
                <span className="px-3 py-2 text-[var(--c-text-muted)]">
                  {page} / {totalPages}
                </span>
                
                {page < totalPages && (
                  <a
                    href={`/needs?${new URLSearchParams({
                      ...searchParams,
                      page: (page + 1).toString()
                    })}`}
                    className={`${u.btn} ${u.btnGhost} ${u.focus}`}
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
    <>
      <TrackListContext />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--c-text)] mb-2">ニーズ一覧</h1>
          <p className="text-[var(--c-text-muted)]">
            {showFullContent ? '公開中のニーズを表示しています' : 'ニーズの概要を表示しています'}
          </p>
        </div>

        <Suspense fallback={<KaichuSkeleton />}>
          <NeedsContent {...props} />
        </Suspense>
      </main>
    </>
  );
}
