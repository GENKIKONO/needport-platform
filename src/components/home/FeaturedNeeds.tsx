import Link from "next/link";

export default function FeaturedNeeds() {
  // 仮のデータ（実際はAPIから取得）
  const needs = [
    { id: "1", title: "地域の高齢者向けデジタルサポート", supporters: 12, goal: 20, category: "IT・システム" },
    { id: "2", title: "地元食材を使った新しい商品開発", supporters: 8, goal: 15, category: "製造・技術" },
    { id: "3", title: "観光客向け多言語対応アプリ", supporters: 15, goal: 25, category: "IT・システム" },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">注目のニーズ</h2>
        <p className="text-gray-600">関心が高い投稿をピックアップ</p>
      </header>
      
      {needs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {needs.map((need) => (
            <Link key={need.id} href={`/needs/${need.id}`} className="block">
              <div className="rounded-xl bg-white p-6 ring-1 ring-slate-200 hover:shadow-md transition">
                <h3 className="font-semibold text-gray-900 mb-2">{need.title}</h3>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span>{need.category}</span>
                  <span>{need.supporters}人賛同</span>
                </div>
                {/* 賛同メーター */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((need.supporters / need.goal) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>目標: {need.goal}人</span>
                  <span>{Math.round((need.supporters / need.goal) * 100)}%</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">現在、注目のニーズはありません</div>
          <Link href="/post" className="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded-md">
            最初のニーズを投稿する
          </Link>
        </div>
      )}
    </section>
  );
}
