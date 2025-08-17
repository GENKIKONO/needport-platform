export const dynamic="force-dynamic"; 
export const revalidate=0;
import Link from "next/link";
import { getNeedsSafe } from "@/lib/demo/data";

export default async function Needs(){
  const needs = await getNeedsSafe();
  return (
    <main className="section space-y-6">
      <h1 className="text-2xl font-bold">みんなの「欲しい」</h1>
      
      {/* Search */}
      <div className="np-card p-6">
        <input 
          placeholder="どんな『欲しい』を探しますか…" 
          className="w-full rounded-xl border px-4 py-3 bg-white/70 mb-4" 
        />
        
        {/* Filters */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select className="rounded-lg border px-3 py-2 bg-white">
            <option>エリア: すべて</option>
            <option>高知市</option>
            <option>三戸町</option>
            <option>久万高原町</option>
          </select>
          <select className="rounded-lg border px-3 py-2 bg-white">
            <option>カテゴリ: すべて</option>
            <option>住宅・建築</option>
            <option>モノづくり</option>
            <option>健康</option>
          </select>
          <select className="rounded-lg border px-3 py-2 bg-white">
            <option>並び替え: 新着</option>
            <option>人気順</option>
            <option>締切順</option>
          </select>
          <button className="btn btn-primary">検索</button>
        </div>
      </div>
      
      {/* Results */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {needs.map(n=>(
          <article key={n.id} className="np-card p-6">
            <h3 className="font-semibold text-gray-900 mb-2">{n.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-4 mb-4">{n.description}</p>
            
            {/* Meta info */}
            <div className="flex items-center gap-2 mb-4">
              <span className="np-badge bg-blue-100 text-blue-800">{n.category}</span>
              <span className="np-badge bg-gray-100 text-gray-600">{n.area}</span>
            </div>
            
            <div className="flex gap-2">
              <Link href={`/needs/${n.id}`} className="btn btn-primary flex-1">
                詳細を見る
              </Link>
              <Link href="/post" className="btn btn-ghost flex-1">
                賛同する
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
