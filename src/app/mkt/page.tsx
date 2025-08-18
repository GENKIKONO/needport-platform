import HeroMarketing from "@/mkt/components/HeroMarketing";

export const metadata = {
  title: "NeedPort - ニーズの港 | リアルな困りごとと業者の提案を安全に成立",
  description: "クラファンではなく、リアルなニーズと業者の提案を安全に成立させるプラットフォーム。投稿→提案→承認→ルーム→安全な支払いまで、この場で完結。",
};

export default function MktPage(){
  return (
    <main className="space-y-12">
      {/* Hero（価値訴求コピー＋CTA2つ） */}
      <section className="container pt-10 mkt-hero">
        <HeroMarketing/>
      </section>

      {/* ベネフィット 2段（利用者向け/事業者向け） */}
      <section className="container">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">なぜNeedPortなのか？</h2>
          <p className="mt-2 text-neutral-600">クラファンとは違う、新しい解決方法</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* 利用者向け */}
          <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">困りごとを抱える方へ</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">匿名で安全</div>
                  <div className="text-sm text-neutral-600">個人情報は書かずに投稿できます</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">仲間が集まる</div>
                  <div className="text-sm text-neutral-600">同じ悩みを持つ人が賛同してくれます</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">安全な決済</div>
                  <div className="text-sm text-neutral-600">Stripeで安心して支払いできます</div>
                </div>
              </div>
            </div>
          </div>

          {/* 事業者向け */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">サービス提供事業者へ</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">新しい顧客獲得</div>
                  <div className="text-sm text-neutral-600">潜在的なニーズを発見できます</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">直接コミュニケーション</div>
                  <div className="text-sm text-neutral-600">運営同席で安心して提案できます</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">確実な成約</div>
                  <div className="text-sm text-neutral-600">承認された提案は確実に進みます</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 注目のニーズ3件 */}
      <section className="container">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">注目のニーズ</h2>
          <p className="mt-2 text-neutral-600">いま話題の困りごとをご紹介</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">地域</span>
              <span className="text-sm text-neutral-500">高知県</span>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">地域の特産品を活用した商品開発</h3>
            <p className="text-sm text-neutral-600 mb-4">高知の特産品を使った新しい商品のアイデアを募集しています。地元の魅力を活かした商品を作りたいです。</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">賛同者: 15人</span>
              <span className="text-sky-600 font-medium">詳細を見る</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">技術</span>
              <span className="text-sm text-neutral-500">全国</span>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">AIを活用した業務効率化ツール</h3>
            <p className="text-sm text-neutral-600 mb-4">中小企業向けのAIツールを開発したいです。日々の業務を効率化できるようなソリューションを求めています。</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">賛同者: 8人</span>
              <span className="text-sky-600 font-medium">詳細を見る</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">教育</span>
              <span className="text-sm text-neutral-500">関東</span>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">オンライン学習プラットフォーム</h3>
            <p className="text-sm text-neutral-600 mb-4">子供向けのオンライン学習サービスを作りたいです。楽しく学べる環境を提供したいと考えています。</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">賛同者: 12人</span>
              <span className="text-sky-600 font-medium">詳細を見る</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">よくある質問</h2>
          <p className="mt-2 text-neutral-600">NeedPortについてよく聞かれる質問</p>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="font-semibold text-neutral-900 mb-2">NeedPortはクラファンと何が違いますか？</h3>
            <p className="text-neutral-600">クラファンは資金調達が目的ですが、NeedPortは実際のサービス提供が目的です。業者からの具体的な提案を受け、承認された後に安全な決済でサービスを提供します。</p>
          </div>
          
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="font-semibold text-neutral-900 mb-2">投稿は無料ですか？</h3>
            <p className="text-neutral-600">はい、投稿は完全無料です。困りごとを投稿して、業者からの提案を待つことができます。成約時のみ手数料が発生します。</p>
          </div>
          
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="font-semibold text-neutral-900 mb-2">個人情報は安全ですか？</h3>
            <p className="text-neutral-600">投稿時は個人情報を書く必要はありません。承認された後に運営が仲介して、安全にコミュニケーションを取ることができます。</p>
          </div>
          
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="font-semibold text-neutral-900 mb-2">手数料はいくらですか？</h3>
            <p className="text-neutral-600">成約金額の10%を手数料として頂戴します。これには運営の仲介費用、決済手数料、サポート費用が含まれています。</p>
          </div>
        </div>
      </section>

      {/* クロージングCTA */}
      <section className="container">
        <div className="bg-gradient-to-r from-sky-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">今すぐ始めませんか？</h2>
          <p className="text-lg mb-8 text-sky-100">困りごとを投稿して、新しい解決方法を見つけましょう</p>
          <a href="/post" className="inline-flex items-center gap-2 bg-white text-sky-600 px-8 py-3 rounded-xl font-semibold hover:bg-sky-50 transition-colors">
            無料で投稿する
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </section>
    </main>
  );
}
