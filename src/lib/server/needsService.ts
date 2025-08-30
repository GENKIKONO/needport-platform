// NeedCard interface definition
interface NeedCard {
  id: string;
  title: string;
  summary: string;
  area: string;
  category: string;
  tags: string[];
  status: string;
  created_at: string;
  updated_at: string;
  prejoin_count: number;
}

// デモ用のactiveニーズ（常に先頭に含める）
const DEMO_ACTIVE_NEED: NeedCard = {
  id: "demo-active-1",
  title: "デモ: 提案ボタン表示用",
  summary: "このニーズは提案ボタンの表示テスト用です。実際のサービスでは削除されます。",
  status: 'active',
  area: '東京都',
  category: 'IT・システム開発',
  tags: ['デモ', 'テスト'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  prejoin_count: 0,
};

export async function getNeeds(filters: any = {}): Promise<{ needs: NeedCard[], total: number }> {
  try {
    // モックデータを返す（API呼び出しは後で実装）
    const mockNeeds: NeedCard[] = [
      {
        id: '1',
        title: 'Webサイト制作',
        summary: '企業のコーポレートサイトを制作したい。レスポンシブデザインで、SEO対策も含めて対応できる業者を探しています。',
        status: 'active',
        area: '東京都',
        category: 'Web制作',
        tags: ['Web制作', 'コーポレートサイト', 'SEO'],
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        prejoin_count: 5,
      },
      {
        id: '2',
        title: 'アプリ開発',
        summary: 'iOSアプリの開発を依頼したい。既存のWebサービスと連携する必要があります。',
        status: 'active',
        area: '全国',
        category: 'アプリ開発',
        tags: ['iOS', 'アプリ開発', 'Web連携'],
        created_at: '2024-01-14T00:00:00Z',
        updated_at: '2024-01-14T00:00:00Z',
        prejoin_count: 3,
      },
      {
        id: '3',
        title: 'システム保守',
        summary: '既存の業務システムの保守・運用を委託したい。月次での定期メンテナンスと障害対応が必要です。',
        status: 'active',
        area: '関東圏',
        category: 'システム保守',
        tags: ['システム保守', '運用', 'メンテナンス'],
        created_at: '2024-01-13T00:00:00Z',
        updated_at: '2024-01-13T00:00:00Z',
        prejoin_count: 2,
      },
    ];

    // デモ用のactiveニーズを常に先頭に追加
    const allNeeds = [DEMO_ACTIVE_NEED, ...mockNeeds];

    // フィルタリング（簡易版）
    let filteredNeeds = allNeeds;
    
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filteredNeeds = filteredNeeds.filter(need => 
        need.title.toLowerCase().includes(keyword) ||
        need.summary.toLowerCase().includes(keyword)
      );
    }

    if (filters.area) {
      filteredNeeds = filteredNeeds.filter(need => 
        need.area.includes(filters.area)
      );
    }

    if (filters.categories && filters.categories.length > 0) {
      filteredNeeds = filteredNeeds.filter(need => 
        filters.categories.includes(need.category)
      );
    }

    // ソート
    if (filters.sort === 'recent') {
      filteredNeeds.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (filters.sort === 'popular') {
      filteredNeeds.sort((a, b) => b.prejoin_count - a.prejoin_count);
    }

    // ページネーション
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedNeeds = filteredNeeds.slice(start, end);

    return {
      needs: paginatedNeeds,
      total: filteredNeeds.length
    };
  } catch (error) {
    console.error('Error in getNeeds:', error);
    // エラー時でもデモニーズは返す
    return {
      needs: [DEMO_ACTIVE_NEED],
      total: 1
    };
  }
}

export async function getNeedById(id: string): Promise<NeedCard | null> {
  try {
    // デモニーズの場合は特別処理
    if (id === "demo-active-1") {
      return DEMO_ACTIVE_NEED;
    }

    // 実際のAPIからデータを取得（現在はモック）
    const mockNeeds: NeedCard[] = [
      {
        id: '1',
        title: 'Webサイト制作',
        summary: '企業のコーポレートサイトを制作したい。レスポンシブデザインで、SEO対策も含めて対応できる業者を探しています。',
        status: 'active',
        area: '東京都',
        category: 'Web制作',
        tags: ['Web制作', 'コーポレートサイト', 'SEO'],
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        prejoin_count: 5,
      },
      {
        id: '2',
        title: 'アプリ開発',
        summary: 'iOSアプリの開発を依頼したい。既存のWebサービスと連携する必要があります。',
        status: 'active',
        area: '全国',
        category: 'アプリ開発',
        tags: ['iOS', 'アプリ開発', 'Web連携'],
        created_at: '2024-01-14T00:00:00Z',
        updated_at: '2024-01-14T00:00:00Z',
        prejoin_count: 3,
      },
    ];

    const need = mockNeeds.find(n => n.id === id);
    return need || null;
  } catch (error) {
    console.error('Error in getNeedById:', error);
    return null;
  }
}
