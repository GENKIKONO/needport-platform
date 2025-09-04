import Link from "next/link";
import SectionBreak from "@/app/(ui2)/_parts/SectionBreak";
import RUMTracker from "@/app/(ui2)/_parts/RUMTracker";

export const metadata = {
  title: "NeedPort - ニーズと事業者をつなぐ港",
  description: "行政・企業のニーズに、最適な事業者をマッチング。NeedPortが、あなたのプロジェクトを成功に導きます。",
};

export const dynamic = "force-static";
export const revalidate = 3600; // 1h

export default function V2Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <RUMTracker />
      {/* Hero */}
      <header className="relative">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 space-y-6">
          <span className="inline-block text-xs font-semibold text-sky-600">
            NeedPort（ニードポート）とは？
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            埋もれた声を、<span className="text-sky-600">つなぐ</span>。形にする。
          </h1>
          <p className="text-slate-600 max-w-2xl">
            顔が見えない安心感 × ニーズの束ね × 透明な取引で、これまで成立しなかった生活ニーズを事業に変えるプラットフォーム。
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="//needs" className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">
              ニーズを探す
            </Link>
            <Link href="//needs/new" className="px-4 py-2 rounded border border-slate-300 hover:bg-slate-50">
              ニーズを投稿
            </Link>
            <span className="px-2 py-1 text-xs rounded bg-sky-100 text-sky-700">匿名で安心</span>
            <span className="px-2 py-1 text-xs rounded bg-sky-100 text-sky-700">賛同で実現</span>
            <span className="px-2 py-1 text-xs rounded bg-sky-100 text-sky-700">成約時10%</span>
          </div>
        </div>
        {/* 港っぽい波（装飾はCSS/inlineで軽量） */}
        <svg className="absolute bottom-[-1px] left-0 w-full" viewBox="0 0 1440 120" aria-hidden focusable="false">
          <path fill="#e0f2fe" d="M0,64L80,69.3C160,75,320,85,480,90.7C640,96,800,96,960,85.3C1120,75,1280,53,1360,42.7L1440,32L1440,0L0,0Z"/>
        </svg>
      </header>

      {/* 価値（不変の軸） */}
      <section className="container-page py-10 sm:py-14 cv-section">
        <h2 className="text-xl font-bold mb-6">NeedPort が大事にしていること</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["小さな声を拾う","匿名で「言いづらい」ニーズも投稿できます。"],
            ["共感が力になる","賛同が集まれば一人では無理でも実現に近づく。"],
            ["顔が見えないから安心","成約まで匿名。しがらみなくフラットに。"],
            ["シンプルな仕組み","成約時10%の手数料。特定業種は月額登録。"],
            ["データが未来をつくる","地域のニーズデータを資産化し次の事業へ。"],
            ["運営が最初の種まき","想定ニーズを提示して鶏卵問題を解消。"],
          ].map(([h,b],i)=>(
            <div key={i} className="bg-white rounded-md shadow-sm border border-slate-100 p-4">
              <div className="font-semibold">{h}</div>
              <div className="text-slate-600 text-sm mt-1">{b}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 流れ */}
      <section className="container-page pb-10 sm:pb-14 cv-section">
        <h2 className="text-xl font-bold mb-6">使い方（匿名→条件すり合わせ→成約）</h2>
        <ol className="grid gap-4 sm:grid-cols-3 list-decimal list-inside">
          {[
            ["ニーズを投稿 / 賛同","匿名で投稿。賛同が集まると事業者から提案が来ます。"],
            ["承認制チャットで条件調整","提案ごとに独立。混線せず安心。"],
            ["成約で必要最小限だけ開示","成約時だけ事業者情報を開示し、取引へ。"],
          ].map(([h,b],i)=>(
            <li key={i} className="bg-white rounded-md shadow-sm border border-slate-100 p-4">
              <div className="font-semibold">{h}</div>
              <div className="text-slate-600 text-sm mt-1">{b}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="container-page pb-16 cv-section">
        <div className="rounded-md border border-sky-100 bg-sky-50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="font-bold">NeedPort をはじめましょう</div>
            <div className="text-slate-600 text-sm">匿名で投稿して、賛同を集め、事業者とマッチング。</div>
          </div>
          <div className="flex gap-2">
            <Link href="//needs/new" className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">ニーズを投稿</Link>
            <Link href="//vendors" className="px-4 py-2 rounded border border-slate-300 hover:bg-slate-50">事業者として参加</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
