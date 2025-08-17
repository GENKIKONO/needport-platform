export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ServicesPage() {
  return (
    <main className="container py-8 space-y-6">
      <h1 className="text-2xl font-bold">企業の「できる」</h1>
      
      {/* Empty State */}
      <div className="card text-center py-12">
        <div className="text-4xl mb-4">🏢</div>
        <h2 className="text-lg font-semibold mb-2">サービス・商品一覧</h2>
        <p className="text-sm text-gray-600 mb-6">0件のサービス・商品があります</p>
        <a href="/company/register" className="btn btn-primary">サービス・商品を登録</a>
      </div>

      {/* Search */}
      <div className="card">
        <input 
          placeholder="サービス・商品を検索..." 
          className="w-full rounded-lg border px-4 py-3 bg-white/70" 
        />
      </div>

      {/* No Results */}
      <div className="text-center py-8">
        <div className="text-6xl mb-4 opacity-30">🔍</div>
        <h3 className="text-lg font-semibold mb-2">該当するサービス・商品が見つかりません</h3>
        <p className="text-sm text-gray-600">別のキーワードで検索してみてください</p>
      </div>
    </main>
  );
}
