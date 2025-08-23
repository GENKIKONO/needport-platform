import { Suspense } from 'react';
import { getDevSession } from '@/lib/devAuth';
import { NeedScope } from '@/lib/needs/scope';
import { queryNeeds, type NeedFilters } from '@/lib/needs/query';
// import NeedsTabs from '@/components/needs/NeedsTabs'; // PDF仕様と競合のためコメントアウト
import NeedsCard from '@/components/needs/NeedsCard';
import SearchForm from '@/components/needs/SearchForm';
import Sidebar from '@/components/needs/Sidebar';
import Pagination from '@/components/needs/Pagination';
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
    keyword?: string;
    area?: string;
    categories?: string;
  };
}

async function getNeeds(searchParams: NeedsPageProps['searchParams']): Promise<{ needs: NeedCard[], total: number }> {
  try {
    // パラメータの正規化
    const filters: NeedFilters = {
      keyword: searchParams.keyword || '',
      area: searchParams.area || '',
      categories: searchParams.categories ? searchParams.categories.split(',') : [],
      sort: ['recent', 'popular', 'deadline'].includes(searchParams.sort || '') 
        ? (searchParams.sort as 'recent' | 'popular' | 'deadline')
        : 'recent',
      scope: ['active', 'kaichu', 'all'].includes(searchParams.scope || '') 
        ? (searchParams.scope as NeedScope)
        : 'active',
      page: Number.isFinite(Number(searchParams.page)) 
        ? Math.max(1, Number(searchParams.page)) 
        : 1,
      limit: 20
    };

    const result = await queryNeeds(filters);
    return { needs: result.needs, total: result.total };
  } catch (error) {
    console.error('Error in getNeeds:', error);
    return { needs: [], total: 0 };
  }
}

async function NeedsContent({ searchParams }: NeedsPageProps) {
  const { needs, total } = await getNeeds(searchParams);
  
  // 強制フォールバック
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

  // 検索フォームの状態
  const searchFormValue = {
    keyword: searchParams.keyword || '',
    area: searchParams.area || '',
    categories: searchParams.categories ? searchParams.categories.split(',') : [],
    sort: sort
  };

  return (
    <div className="lg:grid lg:grid-cols-4 lg:gap-8">
      {/* メインコンテンツ */}
      <div className="lg:col-span-3">
        {/* 検索フォーム */}
        <SearchForm 
          value={searchFormValue}
          onChange={() => {
            // 検索フォームの変更はSearchForm内で処理
          }}
        />
        
        {/* 結果件数表示 */}
        <div className="mb-6 text-sm text-[var(--c-text-muted)]">
          {total}件中 {((page - 1) * limit) + 1}-{Math.min(page * limit, total)}件
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
            {/* ニーズ一覧 */}
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
            
            {/* ページネーション */}
            <Pagination 
              currentPage={page}
              totalPages={totalPages}
              searchParams={searchParams as Record<string, string>}
            />
          </>
        )}
      </div>

      {/* サイドバー */}
      <div className="lg:col-span-1 mt-8 lg:mt-0">
        <Sidebar needs={needs} />
      </div>
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
        <div className="mb-6 text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl font-bold text-[var(--c-text)] mb-2">みんなのニーズ</h1>
          <p className="text-[var(--c-text-muted)]">
            地域から集まるリアルなニーズを探す・応援するための一覧です
          </p>
        </div>

        <Suspense fallback={<KaichuSkeleton />}>
          <NeedsContent {...props} />
        </Suspense>
      </main>
    </>
  );
}
