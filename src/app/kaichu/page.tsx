import { getDevSession } from '@/lib/devAuth';
import { getUserRole } from '@/lib/auth/roles';
import { canViewKaichuFull, canPropose } from '@/lib/auth/ability';
import NeedsCard from '@/components/needs/NeedsCard';

export default async function KaichuPage() {
  const session = await getDevSession();
  const role = getUserRole(session);
  
  // モックデータ（実際のAPIから取得）
  const needs = [
    {
      id: '1',
      title: 'Webサイト制作',
      summary: '企業のコーポレートサイトを制作したい。レスポンシブデザインで、SEO対策も含めて対応できる業者を探しています。',
      body: '企業のコーポレートサイトを制作したい。レスポンシブデザインで、SEO対策も含めて対応できる業者を探しています。',
      status: 'active' as const,
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
      body: 'iOSアプリの開発を依頼したい。既存のWebサービスと連携する必要があります。',
      status: 'active' as const,
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
      body: '既存の業務システムの保守・運用を委託したい。月次での定期メンテナンスと障害対応が必要です。',
      status: 'active' as const,
      area: '関東圏',
      category: 'システム保守',
      tags: ['システム保守', '運用', 'メンテナンス'],
      created_at: '2024-01-13T00:00:00Z',
      updated_at: '2024-01-13T00:00:00Z',
      prejoin_count: 2,
    },
  ];

  const canSeeFull = canViewKaichuFull(role);
  const canUserPropose = canPropose(role);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            海中のニーズ
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            登録ユーザー限定で公開される特別なニーズをご覧いただけます。
            {!canSeeFull && (
              <span className="block mt-2 text-sm text-orange-600">
                全文を閲覧するにはログインが必要です
              </span>
            )}
          </p>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {needs.length}
            </div>
            <div className="text-gray-600">公開中のニーズ</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              85%
            </div>
            <div className="text-gray-600">成約率</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              平均3日
            </div>
            <div className="text-gray-600">マッチング期間</div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">すべてのカテゴリ</option>
              <option value="web">Web制作</option>
              <option value="app">アプリ開発</option>
              <option value="system">システム保守</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">すべてのエリア</option>
              <option value="tokyo">東京都</option>
              <option value="kanto">関東圏</option>
              <option value="national">全国</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">すべての予算</option>
              <option value="low">〜50万円</option>
              <option value="medium">50万円〜100万円</option>
              <option value="high">100万円〜</option>
            </select>
          </div>
        </div>

        {/* ニーズ一覧 */}
        <div className="space-y-6">
          {needs.map((need) => (
            <NeedsCard
              key={need.id}
              need={
                canSeeFull
                  ? need
                  : {
                      ...need,
                      body: need.body.length > 120 
                        ? need.body.substring(0, 120) + '...' 
                        : need.body,
                      masked: true,
                    }
              }
              scope="kaichu"
              canPropose={canUserPropose && need.status === 'active'}
              isAuthenticated={!!session}
            />
          ))}
        </div>

        {/* 登録CTA */}
        {!canSeeFull && (
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 border border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                海中の全文を見るには登録が必要です
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                登録すると、詳細な要件や予算情報、連絡先など、より詳細な情報をご覧いただけます。
                また、直接提案やチャット申請も可能になります。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/auth/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  無料で登録
                </a>
                <a
                  href="/auth/login"
                  className="bg-white hover:bg-gray-50 text-blue-600 font-medium py-3 px-6 rounded-lg border border-blue-600 transition-colors"
                >
                  ログイン
                </a>
              </div>
            </div>
          </div>
        )}

        {/* サービス説明 */}
        <div className="mt-16 bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            海中のニーズとは
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🔒 登録ユーザー限定
              </h3>
              <p className="text-gray-600">
                海中のニーズは、登録ユーザーのみが閲覧できる特別なニーズです。
                より詳細な情報と直接的なコミュニケーションが可能になります。
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🎯 高品質なマッチング
              </h3>
              <p className="text-gray-600">
                事前審査を通過したニーズのみを掲載しているため、
                より確実なマッチングが期待できます。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
