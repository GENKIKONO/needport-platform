import Link from "next/link";

export const metadata = {
  title: "NeedPort – 埋もれた声を、つなぐ。形にする。",
  description: "困りごと投稿 → 事業者提案 → 成約まで。安心・透明なニーズマッチングプラットフォーム。",
  openGraph: { title: "NeedPort", url: "https://needport.jp", siteName: "NeedPort" },
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 to-white">
      <header className="sticky top-0 z-50 bg-white border-b">
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-sky-600 font-bold text-lg">NeedPort</Link>
          <div className="flex gap-6 text-sm font-medium text-slate-700">
            <Link href="/needs">ニーズ一覧</Link>
            <Link href="/me">マイページ</Link>
            <Link href="/sign-in">ログイン</Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 py-20 text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            埋もれた声を、<span className="text-sky-600">つなぐ</span>。形にする。
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            NeedPortは、困りごとを匿名で投稿し、事業者からの提案を通じて安心・透明に成約できる新しいマッチングプラットフォームです。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/needs/new" className="px-6 py-3 rounded bg-sky-600 text-white hover:bg-sky-700">
              ニーズを投稿
            </Link>
            <Link href="/needs" className="px-6 py-3 rounded border border-slate-300 hover:bg-slate-50">
              ニーズを探す
            </Link>
          </div>
        </section>

        {/* 3ステップガイド */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold text-center mb-8">はじめかた（3ステップ）</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              ["困りごとを投稿", "匿名で安心してニーズを投稿できます。"],
              ["事業者が提案", "賛同が集まると事業者から提案が届きます。"],
              ["成約・実現", "成約後に必要最小限だけ情報を開示します。"],
            ].map(([title, desc], i) => (
              <div key={i} className="bg-white border rounded-md p-6 shadow-sm">
                <div className="text-sky-600 font-semibold mb-2">{title}</div>
                <div className="text-slate-600 text-sm">{desc}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="mx-auto max-w-7xl px-4 py-10 grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm text-slate-600">
          <div>
            <div className="font-semibold mb-2">会社情報</div>
            <ul className="space-y-1">
              <li><Link href="/info/company">会社情報</Link></li>
              <li><Link href="/info/tokushoho">特商法に基づく表記</Link></li>
              <li><Link href="/info/terms">利用規約</Link></li>
              <li><Link href="/info/privacy">プライバシーポリシー</Link></li>
              <li><Link href="/info/contact">お問い合わせ</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">利用ガイド</div>
            <ul className="space-y-1">
              <li><Link href="/roadmap">サービス航海図</Link></li>
              <li><Link href="/me/vendor/guide">事業者提案ガイド</Link></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs text-slate-400 py-4 border-t">
          © 2025 NeedPort
        </div>
      </footer>
    </div>
  );
}