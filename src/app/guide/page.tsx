import NauticalHero from "@/components/NauticalHero";
import StepRail from "@/components/StepRail";
import Link from "next/link";

export const metadata = { title: "サービス航海図 | NeedPort" };

export default function GuidePage() {
  return (
    <main className="space-y-12">
      {/* Hero with harbor vibe */}
      <section className="container">
        <NauticalHero />
      </section>

      {/* 5ステップ（航路でつなぐ） */}
      <section className="container">
        <h2 className="text-center text-xl font-semibold text-neutral-900">5ステップで理解する使い方</h2>
        <p className="mt-2 text-center text-neutral-700">NeedPortでの航海の進め方をわかりやすく説明します</p>
        <StepRail />
      </section>

      {/* よくある質問（3カラム→1カラム） */}
      <section className="container">
        <h2 className="text-xl font-semibold mb-4 text-neutral-900">よくある質問</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {t:'基本的な使い方', items:['NeedPortは無料ですか？','匿名で投稿できますか？','スマホだけで使えますか？']},
            {t:'ニーズ投稿について', items:['どんなニーズでも投稿できますか？','不適切な投稿への対処は？','賛同は取り消せますか？']},
            {t:'マッチング・取引', items:['案件ルームとは？','承認制チャットの仕組み','決済はどうなりますか？']},
          ].map((c,i)=>(
            <div key={i} className="surface-soft p-5">
              <div className="font-semibold text-neutral-900">{c.t}</div>
              <ul className="mt-3 space-y-2 text-neutral-700">
                {c.items.map((q,idx)=>(<li key={idx}>・{q}</li>))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 最後のCTA */}
      <section className="container">
        <div className="surface-soft p-5 text-center">
          <div className="step-kicker justify-center">出航の準備はOK？</div>
          <h3 className="mt-2 text-2xl font-bold text-neutral-900">ニーズを投稿してはじめる</h3>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link href="/post" className="btn btn-primary h-11 whitespace-nowrap">ニーズを投稿</Link>
            <Link href="/needs" className="btn btn-ghost h-11 whitespace-nowrap">みんなの「欲しい」</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
