import Link from "next/link";

const CONTENT_ITEMS = [
  {
    id: 1,
    title: "PR Movie",
    desc: "NeedPortの紹介動画",
    href: "/guide/video",
    type: "video",
    color: "bg-blue-500",
    icon: "🎥"
  },
  {
    id: 2,
    title: "地域づくり",
    desc: "地域活性化の取り組み",
    href: "/success/stories",
    type: "article",
    color: "bg-green-500",
    icon: "🏘️"
  },
  {
    id: 3,
    title: "運命の仕事",
    desc: "キャリア形成支援",
    href: "/guide/career",
    type: "article",
    color: "bg-pink-500",
    icon: "💼"
  },
  {
    id: 4,
    title: "ディープな",
    desc: "専門的な解説",
    href: "/guide/deep",
    type: "article",
    color: "bg-gray-800",
    icon: "🔍"
  },
  {
    id: 5,
    title: "スコカンパニー",
    desc: "企業インタビュー",
    href: "/vendors/interviews",
    type: "interview",
    color: "bg-white",
    icon: "⭐"
  },
  {
    id: 6,
    title: "NeedPort",
    desc: "プラットフォーム紹介",
    href: "/about",
    type: "article",
    color: "bg-emerald-500",
    icon: "🚢"
  },
];

export default function ContentBlocks() {
  return (
    <section className="section">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">学習系コンテンツ</h2>
          <p className="text-gray-600">使い方動画、成功事例、事業者インタビュー</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CONTENT_ITEMS.map((item) => (
            <Link 
              key={item.id} 
              href={item.href}
              className="block group"
            >
              <div className={`rounded-xl p-6 text-white transition-all hover:shadow-lg hover:scale-105 ${item.color} ${item.color === 'bg-white' ? 'text-gray-900' : ''}`}>
                <div className="text-center">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm opacity-90 mb-4">{item.desc}</p>
                  <div className="text-sm font-medium opacity-75 group-hover:opacity-100 transition-opacity">
                    詳細を見る →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* 一覧を見るボタン */}
        <div className="text-center mt-8">
          <Link 
            href="/guide" 
            className="inline-flex items-center px-6 py-3 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors"
          >
            一覧を見る
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
