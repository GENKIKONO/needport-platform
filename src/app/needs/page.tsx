import { getNeeds } from '@/lib/server/needsService';
import NeedsCard from '@/components/needs/NeedsCard';
import SearchForm from '@/components/needs/SearchForm';

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';

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

export default async function NeedsPage(props: NeedsPageProps) {
  let needs: NeedCard[] = [];
  let total = 0;
  
  try {
    const result = await getNeeds({
      keyword: props.searchParams.keyword || '',
      area: props.searchParams.area || '',
      categories: props.searchParams.categories ? props.searchParams.categories.split(',') : [],
      sort: props.searchParams.sort || 'recent',
      page: Number(props.searchParams.page) || 1,
      limit: 20
    });
    needs = result.needs;
    total = result.total;
  } catch (error) {
    console.error('Error in NeedsPage:', error);
    needs = [];
    total = 0;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6 text-center lg:text-left">
        <h1 className="text-3xl lg:text-4xl font-bold text-[var(--c-text)] mb-2">みんなのニーズ</h1>
        <p className="text-[var(--c-text-muted)]">
          地域から集まるリアルなニーズを探す・応援するための一覧です
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        {/* メインコンテンツ */}
        <div className="lg:col-span-3">
          {/* 検索フォーム */}
          <SearchForm />
          
          {/* 結果件数表示 */}
          <div className="mb-6 text-sm text-[var(--c-text-muted)]">
            {total}件のニーズが見つかりました
          </div>

          {needs.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">該当するニーズが見つかりません</h3>
              <p className="text-gray-600 mb-4">条件を調整してください</p>
              <a href="/needs" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                フィルタをリセット
              </a>
            </div>
          ) : (
            <>
              {/* ニーズ一覧 */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {needs.map((need) => (
                  <NeedsCard 
                    key={need.id} 
                    need={need} 
                    scope="active"
                    isPreview={false}
                    canPropose={false}
                    isAuthenticated={false}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* サイドバー */}
        <div className="lg:col-span-1 mt-8 lg:mt-0">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold mb-4">フィルタ</h3>
            <p className="text-sm text-gray-600">フィルタ機能は後で実装予定です</p>
          </div>
        </div>
      </div>
    </main>
  );
}
