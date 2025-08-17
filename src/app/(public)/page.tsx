import Link from "next/link";
import { getNeedsSafe } from "@/lib/demo/data";

export const dynamic = "force-dynamic"; 
export const revalidate = 0;

export default async function Home(){
  const needs = await getNeedsSafe(); // DB優先→失敗時モック
  const hot = needs.filter(n=> (n.progress ?? 0) >= 0.8).slice(0,3);
  return (
    <main className="container py-6 md:py-10 space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 text-white px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-4xl md:text-6xl font-extrabold drop-shadow-sm">実現する力</div>
          <p className="mt-4 text-lg md:text-xl opacity-95">需要が見えるから、安心して提供できる。</p>
          <p className="mt-1 opacity-90">確実なニーズに基づくサービス創造</p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/post" className="btn btn-primary">ニーズを投稿</Link>
            <Link href="/needs" className="btn btn-ghost">みんなの「欲しい」</Link>
          </div>
        </div>
      </section>

      {/* もうすぐ成立 */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-2">もうすぐ成立</h2>
        <p className="text-center text-sm text-gray-500 mb-6">あと少しで実現！今すぐ参加しよう</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hot.map(n=>(
            <article key={n.id} className="card">
              <header className="flex items-start justify-between gap-3">
                <h3 className="font-semibold">{n.title}</h3>
                <span className="rounded-full bg-red-500/10 text-red-600 text-xs px-2 py-1">あと{Math.max(1, Math.ceil((n.target??10)-(n.count??0)))}人</span>
              </header>
              <p className="mt-2 text-sm text-gray-600 line-clamp-3">{n.description}</p>
              <div className="mt-3">
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-orange-500" style={{width: `${Math.min(100, Math.round((n.progress??0)*100))}%`}}/>
                </div>
                <div className="mt-1 text-xs text-right text-gray-500">{Math.round((n.progress??0)*100)}%</div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href={`/needs/${n.id}`} className="btn btn-primary flex-1">いますぐ賛同する</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* カテゴリー（ダミーリンク） */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-2">どんなニーズがありますか？</h2>
        <p className="text-center text-sm text-gray-500 mb-6">カテゴリーからニーズを探す</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {["住まい","モノづくり","飲食","健康","ビジネス相談","その他"].map(c=>(
            <Link key={c} href={`/needs?category=${encodeURIComponent(c)}`} className="card hover:shadow-lg transition">
              <div className="text-center py-6">{c}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* 注目のニーズ（最新3） */}
      <section>
        <h2 className="text-2xl font-bold mb-4">注目のニーズ</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {needs.slice(0,3).map(n=>(
            <article key={n.id} className="card">
              <h3 className="font-semibold">{n.title}</h3>
              <p className="mt-2 text-sm text-gray-600 line-clamp-4">{n.description}</p>
              <div className="mt-4 flex gap-2">
                <Link href={`/needs/${n.id}`} className="btn btn-primary flex-1">詳細を見る</Link>
                <Link href="/post" className="btn flex-1">賛同する</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
