import Link from 'next/link'
export const dynamic = 'force-dynamic'
export default function Guide() {
  return (
    <main className="space-y-10">
      {/* Hero（青系で視認性UP） */}
      <section className="surface-soft hero-sky px-6 py-10 md:py-14">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-balance">NeedPort サービス航海図</h1>
          <p className="mt-3 text-neutral-700 text-balance">
            初めての方も、慣れた方も。安全で快適な航海のための完全ガイド
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/post" className="btn btn-primary h-11 whitespace-nowrap">あなたの「欲しい」を投稿</Link>
            <Link href="/needs" className="btn btn-ghost h-11 whitespace-nowrap">みんなの「欲しい」</Link>
          </div>
        </div>
      </section>

      {/* 5ステップ */}
      <section className="section">
        <h2 className="text-xl font-semibold mb-4">5ステップで理解する使い方</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {t:'アカウント登録', d:'まずは無料でアカウントを作成。メールアドレスのみでOK。', bg:'from-blue-50'},
            {t:'ニーズを投稿', d:'「こんなあったらいいな」を投稿。匿名でも大丈夫。', bg:'from-emerald-50'},
            {t:'仲間を集める', d:'賛同が集まると注目度UP。関心メーターで見える化。', bg:'from-amber-50'},
            {t:'企業からアプローチ', d:'提案が届いたら承認して案件ルームへ。', bg:'from-violet-50'},
            {t:'夢が現実に', d:'マイルストーンで進行管理。必要に応じて決済（与信）へ。', bg:'from-rose-50'},
          ].map((s,i)=>(
            <div key={i} className={`p-5 rounded-xl ring-1 ring-black/5 bg-gradient-to-b ${s.bg} to-white`}>
              <div className="text-lg font-semibold">{i+1}. {s.t}</div>
              <p className="mt-2 text-neutral-700">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* よくある質問（3カラム→1カラム） */}
      <section className="section">
        <h2 className="text-xl font-semibold mb-4">よくある質問</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {t:'基本的な使い方', items:['NeedPortは無料ですか？','匿名で投稿できますか？','スマホだけで使えますか？']},
            {t:'ニーズ投稿について', items:['どんなニーズでも投稿できますか？','不適切な投稿への対処は？','賛同は取り消せますか？']},
            {t:'マッチング・取引', items:['案件ルームとは？','承認制チャットの仕組み','決済はどうなりますか？']},
          ].map((c,i)=>(
            <div key={i} className="surface-soft p-5">
              <div className="font-semibold">{c.t}</div>
              <ul className="mt-3 space-y-2 text-neutral-700">
                {c.items.map((q,idx)=>(<li key={idx}>・{q}</li>))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/post" className="btn btn-primary h-11 whitespace-nowrap">ニーズを投稿してみる</Link>
          <Link href="/needs" className="btn btn-ghost h-11 whitespace-nowrap">みんなのニーズを探す</Link>
        </div>
      </section>
    </main>
  )
}
