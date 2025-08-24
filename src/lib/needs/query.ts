import { createAdminClient } from '@/lib/supabase/admin';

export interface NeedFilters {
  keyword?: string;
  area?: string;
  categories?: string[];
  sort?: 'recent' | 'popular' | 'deadline';
  scope?: 'active' | 'kaichu' | 'all';
  page?: number;
  limit?: number;
}

export interface NeedQueryResult {
  needs: any[];
  total: number;
  page: number;
  totalPages: number;
}

// ダミーデータ（Supabase未接続時のフォールバック）
const DUMMY_NEEDS = [
  {
    id: '1',
    title: 'Webサイト制作のデザインを依頼したい',
    summary: '企業のコーポレートサイトのデザイン制作をお願いします。モダンで洗練されたデザインを希望しています。',
    body: '詳細な要件、背景、希望する成果物などを記述してください。',
    area: '東京',
    tags: ['Webデザイン', 'コーポレートサイト', 'モダンデザイン'],
    status: 'active',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    prejoin_count: 5
  },
  {
    id: '2',
    title: 'アプリ開発のパートナーを探しています',
    summary: 'モバイルアプリの開発パートナーを探しています。React Nativeでの開発経験がある方を希望します。',
    body: '詳細な要件、背景、希望する成果物などを記述してください。',
    area: '大阪',
    tags: ['アプリ開発', 'React Native', 'モバイル'],
    status: 'active',
    created_at: '2024-01-14T15:30:00Z',
    updated_at: '2024-01-14T15:30:00Z',
    prejoin_count: 3
  },
  {
    id: '3',
    title: 'マーケティング戦略の相談',
    summary: '新商品のマーケティング戦略について相談できる方を探しています。SNS活用のノウハウもお聞かせください。',
    body: '詳細な要件、背景、希望する成果物などを記述してください。',
    area: '福岡',
    tags: ['マーケティング', 'SNS', '戦略'],
    status: 'closed',
    created_at: '2024-01-13T09:15:00Z',
    updated_at: '2024-01-13T09:15:00Z',
    prejoin_count: 8
  }
];

export async function queryNeeds(filters: NeedFilters): Promise<NeedQueryResult> {
  try {
    const supabase = createAdminClient();
    
    // パラメータの正規化
    const {
      keyword = '',
      area = '',
      categories = [],
      sort = 'recent',
      scope = 'active',
      page = 1,
      limit = 20
    } = filters;

    let query = supabase
      .from('needs')
      .select('id, title, summary, area, tags, status, created_at, updated_at, prejoin_count', { count: 'exact' });

    // キーワード検索
    if (keyword.trim()) {
      query = query.or(`title.ilike.%${keyword}%,summary.ilike.%${keyword}%`);
    }

    // エリアフィルタ
    if (area) {
      query = query.eq('area', area);
    }

    // カテゴリフィルタ（タグ内検索）
    if (categories.length > 0) {
      query = query.or(categories.map(cat => `tags.cs.{${cat}}`).join(','));
    }

    // スコープフィルタ
    if (scope === 'active') {
      query = query.eq('status', 'active');
    } else if (scope === 'kaichu') {
      const cutoffDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
      query = query.or(`status.eq.archived,status.eq.closed,created_at.lte.${cutoffDate}`);
    }

    // ソート
    switch (sort) {
      case 'popular':
        query = query.order('prejoin_count', { ascending: false });
        break;
      case 'deadline':
        query = query.order('created_at', { ascending: true });
        break;
      case 'recent':
      default:
        query = query.order('updated_at', { ascending: false });
        break;
    }

    // ページネーション
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      needs: data || [],
      total,
      page,
      totalPages
    };

  } catch (error) {
    console.error('Error in queryNeeds:', error);
    
    // フォールバック: ダミーデータで検索・フィルタ
    let filteredNeeds = [...DUMMY_NEEDS];

    // キーワード検索
    if (filters.keyword?.trim()) {
      const keyword = filters.keyword.toLowerCase();
      filteredNeeds = filteredNeeds.filter(need =>
        need.title.toLowerCase().includes(keyword) ||
        need.summary.toLowerCase().includes(keyword)
      );
    }

    // エリアフィルタ
    if (filters.area) {
      filteredNeeds = filteredNeeds.filter(need => need.area === filters.area);
    }

    // カテゴリフィルタ
    if (filters.categories && filters.categories.length > 0) {
      filteredNeeds = filteredNeeds.filter(need => 
        filters.categories!.some(cat => need.tags.includes(cat))
      );
    }

    // スコープフィルタ
    if (filters.scope === 'active') {
      filteredNeeds = filteredNeeds.filter(need => need.status === 'active');
    } else if (filters.scope === 'kaichu') {
      filteredNeeds = filteredNeeds.filter(need => need.status !== 'active');
    }

    // ソート
    switch (filters.sort) {
      case 'popular':
        filteredNeeds.sort((a, b) => b.prejoin_count - a.prejoin_count);
        break;
      case 'deadline':
        filteredNeeds.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'recent':
      default:
        filteredNeeds.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
    }

    // ページネーション
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    const paginatedNeeds = filteredNeeds.slice(offset, offset + limit);

    return {
      needs: paginatedNeeds,
      total: filteredNeeds.length,
      page,
      totalPages: Math.ceil(filteredNeeds.length / limit)
    };
  }
}
