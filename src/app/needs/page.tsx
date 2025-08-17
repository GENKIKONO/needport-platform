export const dynamic="force-dynamic"; 
export const revalidate=0;
import Link from "next/link";
import { getNeedsSafe } from "@/lib/demo/data";
export default async function Needs(){
  const needs = await getNeedsSafe();
  return (
    <main className="container py-8 space-y-6">
      <h1 className="text-2xl font-bold">みんなの「欲しい」</h1>
      <div className="card">
        <input placeholder="どんな『欲しい』を探しますか…" className="w-full rounded-xl border px-4 py-3 bg-white/70" />
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <select className="rounded-lg border px-3 py-2"><option>エリア: すべて</option></select>
          <select className="rounded-lg border px-3 py-2"><option>カテゴリ: すべて</option></select>
          <select className="rounded-lg border px-3 py-2"><option>並び替え: 新着</option></select>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {needs.map(n=>(
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
    </main>
  );
}
