import Link from "next/link";

export default function FeaturedNeeds() {
  // 仮のデータ（実際はAPIから取得）
  const needs = [
    { 
      id: "1", 
      title: "地域の高齢者向けデジタルサポート", 
      supporters: 12, 
      goal: 20, 
      category: "IT・システム",
      city: "高知市",
      image: "/images/needs/digital-support.jpg",
      stage: "consider" as const,
      interest: 30,
      consider: 45,
      buy: 25
    },
    { 
      id: "2", 
      title: "地元食材を使った新しい商品開発", 
      supporters: 8, 
      goal: 15, 
      category: "製造・技術",
      city: "南国市",
      image: "/images/needs/food-development.jpg",
      stage: "interest" as const,
      interest: 60,
      consider: 30,
      buy: 10
    },
    { 
      id: "3", 
      title: "観光客向け多言語対応アプリ", 
      supporters: 15, 
      goal: 25, 
      category: "IT・システム",
      city: "室戸市",
      image: "/images/needs/tourism-app.jpg",
      stage: "buy" as const,
      interest: 20,
      consider: 35,
      buy: 45
    },
  ];

  return (
    <section className="section">
      <div className="max-w-6xl mx-auto px-4">
        <header className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">注目のニーズ</h2>
          <p className="text-gray-600">関心が高い投稿をピックアップ</p>
        </header>
        
        {needs.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {needs.map((need) => (
                <Link key={need.id} href={`/needs/${need.id}`} className="block">
                  <div className="rounded-xl bg-white ring-1 ring-slate-200 hover:shadow-md transition overflow-hidden">
                    {/* 画像 */}
                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-white text-2xl mb-2">
                            {need.category === 'IT・システム' && '💻'}
                            {need.category === '製造・技術' && '⚙️'}
                            {need.category === 'デザイン・クリエイティブ' && '🎨'}
                            {need.category === 'マーケティング' && '📈'}
                            {need.category === '営業・販売' && '💼'}
                            {need.category === '事務・管理' && '📋'}
                            {need.category === 'サービス' && '🤝'}
                            {need.category === 'その他' && '📌'}
                          </div>
                          <span className="text-white font-medium">{need.category}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2">{need.title}</h3>
                      
                      {/* タグ */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{need.city}</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{need.category}</span>
                      </div>
                      
                      {/* 段階チップ */}
                      <div className="mb-3">
                        <span className={`px-2 py-1 text-xs rounded-full text-white
                          ${need.stage === 'interest' ? 'bg-[var(--chip-interest)]' : ''}
                          ${need.stage === 'consider' ? 'bg-[var(--chip-consider)]' : ''}
                          ${need.stage === 'buy' ? 'bg-[var(--chip-buy)]' : ''}`}>
                          {need.stage === 'interest' && '興味あり'}
                          {need.stage === 'consider' && '検討中'}
                          {need.stage === 'buy' && '購入希望'}
                        </span>
                      </div>
                      
                      {/* 賛同メーター（3色積層） */}
                      <div className="mb-3">
                        <div className="w-full h-2 rounded-full overflow-hidden bg-slate-200">
                          <div 
                            className="h-2 bg-[var(--chip-interest)]"
                            style={{ width: `${need.interest}%` }}
                          />
                          <div 
                            className="h-2 bg-[var(--chip-consider)]"
                            style={{ width: `${need.consider}%` }}
                          />
                          <div 
                            className="h-2 bg-[var(--chip-buy)]"
                            style={{ width: `${need.buy}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>興味: {need.interest}%</span>
                          <span>検討: {need.consider}%</span>
                          <span>購入: {need.buy}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{need.supporters}人賛同</span>
                        <span>目標: {need.goal}人</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* 一覧を見るボタン */}
            <div className="text-center mt-8">
              <Link 
                href="/needs" 
                className="inline-flex items-center px-6 py-3 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors"
              >
                一覧を見る
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">現在、注目のニーズはありません</div>
            <Link href="/post" className="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded-md">
              最初のニーズを投稿する
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
