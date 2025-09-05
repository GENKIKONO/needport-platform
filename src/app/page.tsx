// src/app/page.tsx
import Link from "next/link";

type Need = { id: string; title: string; category: string; region: string; proposals: number; status?: "surfaced"|"completed" };
const featured: Need[] = [
  { id:"np-101", title:"自宅サウナを設置したい", category:"リフォーム", region:"港区",   proposals:4, status:"surfaced" },
  { id:"np-104", title:"地下室の防音改修",       category:"リフォーム", region:"大田区", proposals:7 },
  { id:"np-106", title:"空き家の片付け・買取相談", category:"不動産",   region:"足立区", proposals:3, status:"completed" },
];

export default function Home(){
  return (
    <div className="space-y-10">
      {/* ヒーロー（AppShellのHeaderとは別） */}
      <section className="overflow-hidden rounded-md border bg-gradient-to-b from-sky-50 to-white">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center space-y-5">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            埋もれた声を、<span className="text-sky-600">つなぐ。</span>形にする。
          </h1>
          <p className="text-slate-600">
            NeedPortは、困りごとを匿名で投稿し、事業者からの提案を通じて安心・透明に成約できる
            新しいマッチングプラットフォームです。
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/needs/new" className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">ニーズを投稿</Link>
            <Link href="/needs"     className="px-4 py-2 rounded border hover:bg-slate-50">ニーズを探す</Link>
          </div>
        </div>
      </section>

      {/* 注目のニーズ（カード） */}
      <section className="mx-auto max-w-5xl">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold">注目のニーズ</h2>
          <Link href="/needs" className="text-sky-700 underline text-sm">すべて見る</Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map(n=>(
            <div key={n.id} className="border rounded-md bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Link href={`/needs/${n.id}`} className="font-semibold hover:underline">{n.title}</Link>
                {n.status==="surfaced"  && <span className="text-[11px] px-2 py-0.5 rounded bg-amber-100 text-amber-800">浮上中</span>}
                {n.status==="completed" && <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">成約</span>}
              </div>
              <div className="mt-1 text-xs text-slate-600">カテゴリ：{n.category}・地域：{n.region}</div>
              <div className="mt-3 flex gap-2">
                <Link href={`/needs/${n.id}`}      className="text-sm px-2 py-1 rounded border">詳細</Link>
                <Link href={`/needs/${n.id}#cta`}  className="text-sm px-2 py-1 rounded border">提案する</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* はじめかた（3ステップ） */}
      <section className="mx-auto max-w-5xl">
        <h2 className="text-xl font-bold">はじめかた（3ステップ）</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {[
            ["困りごとを投稿","匿名で安心してニーズを投稿できます。"],
            ["事業者が提案","質問が揃うと事業者から提案が届きます。"],
            ["成約・実現","成約後に必要最小限だけ情報を開示します。"],
          ].map(([h,b],i)=>(
            <div key={i} className="border rounded-md bg-white p-4">
              <div className="font-semibold">{h}</div>
              <div className="text-sm text-slate-600 mt-1">{b}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}