import Link from "next/link";

const NEWS = [
  { id: 1, title: "NeedPortが正式リリースされました", date: "2024-12-01" },
  { id: 2, title: "事業者向け提案ツールが登場", date: "2024-11-28" },
  { id: 3, title: "地域のニーズ投稿が100件を突破", date: "2024-11-25" },
  { id: 4, title: "使い方ガイドを更新しました", date: "2024-11-20" },
      { id: 5, title: "サポート機能を開始", date: "2024-11-15" },
];

export default function NewsList() {
  return (
    <section className="section">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">お知らせ</h2>
          <Link href="/news" className="text-sky-600 hover:underline">
            一覧を見る →
          </Link>
        </div>
        <div className="space-y-4">
          {NEWS.map(news => (
            <div key={news.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <span className="font-medium">{news.title}</span>
              <span className="text-sm text-slate-500">{news.date}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
