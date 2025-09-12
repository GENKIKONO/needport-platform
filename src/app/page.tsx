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
    <div className="space-y-16">
      {/* ヒーロー - イラスト調の柔らかいデザイン */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50/30 via-slate-50 to-blue-50/50 border border-blue-100/50">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-16 left-12 w-24 h-24 bg-blue-200/60 rounded-full blur-lg"></div>
          <div className="absolute top-40 right-16 w-16 h-16 bg-slate-300/40 rounded-full blur-md"></div>
          <div className="absolute bottom-24 left-1/4 w-20 h-20 bg-blue-300/50 rounded-full blur-lg"></div>
        </div>
        <div className="relative mx-auto max-w-5xl px-6 py-24 text-center space-y-8">
          <div className="inline-flex items-center gap-2 mb-6 px-5 py-3 bg-white/70 backdrop-blur-sm rounded-full border border-blue-100/60 shadow-sm">
            <div className="w-2 h-2 bg-blue-400/70 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-600 font-medium">みんなの想いをつなぐ場所</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-800 leading-tight">
            埋もれた声を、<br />
            <span className="text-blue-600/80 relative">
              つなぐ。
              <div className="absolute -bottom-2 left-0 w-full h-3 bg-blue-200/60 rounded-full"></div>
            </span>
            <span className="text-slate-700">形にする。</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            困りごとを温かく受け止めて、地域の事業者さんと<br />
            安心・透明につながる、新しい出会いの場です。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
            <Link 
              href="/needs/new" 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-blue-500/90 text-white font-semibold hover:bg-blue-600/90 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              ニーズを投稿する
            </Link>
            <Link 
              href="/needs" 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 font-semibold hover:bg-white border border-blue-100/60 hover:border-blue-200/60 transform hover:scale-105 transition-all duration-300 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              ニーズを探す
            </Link>
          </div>
        </div>
      </section>

      {/* ブランドストーリー - 素敵な世界観 */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 border border-blue-100/30 p-12 sm:p-16">
          {/* 装飾的な背景要素 */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-8 left-8 w-32 h-32 bg-blue-200/40 rounded-full blur-2xl"></div>
            <div className="absolute bottom-12 right-12 w-24 h-24 bg-slate-300/30 rounded-full blur-xl"></div>
          </div>
          
          <div className="relative text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 leading-tight">
                誰かの「困った」が<br />
                誰かの「喜び」になる場所
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                街の小さな困りごとから、大きな夢まで。<br />
                みんなで支え合いながら、温かい未来を紡いでいく。
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-8 mt-12">
              <div className="space-y-3 text-center">
                <div className="w-16 h-16 mx-auto bg-white/70 rounded-2xl flex items-center justify-center shadow-sm">
                  <svg className="w-8 h-8 text-blue-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">想いを大切に</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  一人ひとりの声に耳を傾け、小さなニーズも見逃さない
                </p>
              </div>

              <div className="space-y-3 text-center">
                <div className="w-16 h-16 mx-auto bg-white/70 rounded-2xl flex items-center justify-center shadow-sm">
                  <svg className="w-8 h-8 text-slate-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">地域とつながる</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  地域の事業者と住民が自然に出会える温かい関係づくり
                </p>
              </div>

              <div className="space-y-3 text-center">
                <div className="w-16 h-16 mx-auto bg-white/70 rounded-2xl flex items-center justify-center shadow-sm">
                  <svg className="w-8 h-8 text-blue-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">未来を創る</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  今日の小さなアクションが、明日の豊かな暮らしの種になる
                </p>
              </div>
            </div>

            <div className="pt-6">
              <p className="text-base text-slate-700 italic font-medium">
                "必要なものが、必要な人に、自然と届く世界"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 注目のニーズ - シンプルで柔らかいカード */}
      <section className="mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100/60 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">注目のニーズ</h2>
          </div>
          <Link href="/needs" className="text-blue-600/80 hover:text-blue-700 font-medium text-sm flex items-center gap-1 transition-colors">
            すべて見る 
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map(n=>(
            <div key={n.id} className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-blue-50/50 hover:shadow-md hover:border-blue-100/60 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/needs/${n.id}`} className="text-lg font-semibold text-slate-800 hover:text-blue-600/80 transition-colors line-clamp-2 leading-snug">
                      {n.title}
                    </Link>
                    {n.status==="surfaced"  && (
                      <span className="inline-flex items-center gap-2 mt-2 text-xs px-3 py-1.5 rounded-full bg-blue-50/60 text-blue-700/80 font-medium border border-blue-100/40">
                        <div className="w-1.5 h-1.5 bg-blue-400/70 rounded-full animate-pulse"></div>
                        浮上中
                      </span>
                    )}
                    {n.status==="completed" && (
                      <span className="inline-flex items-center gap-2 mt-2 text-xs px-3 py-1.5 rounded-full bg-slate-50/60 text-slate-600 font-medium border border-slate-100/40">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        成約済み
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {n.region}
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {n.category}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-blue-50/50">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {n.proposals}件の提案
                  </span>
                  <div className="flex gap-2">
                    <Link 
                      href={`/needs/${n.id}`} 
                      className="text-sm px-4 py-2 rounded-full border border-blue-100/60 text-blue-600/80 hover:bg-blue-50/50 transition-all duration-300"
                    >
                      詳細
                    </Link>
                    <Link 
                      href={`/needs/${n.id}#cta`} 
                      className="text-sm px-4 py-2 rounded-full bg-blue-500/90 text-white hover:bg-blue-600/90 transition-all duration-300 shadow-sm"
                    >
                      提案する
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* はじめかた - シンプルで柔らかい3ステップ */}
      <section className="mx-auto max-w-5xl px-4">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-6 h-6 rounded-full bg-blue-100/60 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">はじめかた</h2>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            簡単3ステップで、あなたの困りごとが温かい解決につながります
          </p>
        </div>
        
        <div className="grid gap-8 sm:grid-cols-3 relative">
          {/* 繋がりを表現する線 */}
          <div className="hidden sm:block absolute top-20 left-1/4 right-1/4 h-px bg-gradient-to-r from-blue-100/40 via-slate-200/60 to-blue-100/40"></div>
          
          {[
            {
              step: "1",
              title: "困りごとを投稿",
              desc: "匿名で安心して、あなたの「こんなのあったらいいな」を投稿してみてください。",
              color: "from-blue-50/40 to-slate-50/60",
              icon: (
                <svg className="w-6 h-6 text-blue-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              )
            },
            {
              step: "2", 
              title: "事業者が提案",
              desc: "地域の事業者さんから、温かい提案やアイデアが届きます。",
              color: "from-slate-50/60 to-blue-50/40",
              icon: (
                <svg className="w-6 h-6 text-slate-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )
            },
            {
              step: "3",
              title: "成約・実現", 
              desc: "安心・透明な形で成約し、必要な情報だけを共有して実現へ。",
              color: "from-blue-50/40 to-slate-50/60",
              icon: (
                <svg className="w-6 h-6 text-blue-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              )
            }
          ].map(({step, title, desc, color, icon},i)=>(
            <div key={i} className="relative text-center group">
              <div className={`relative bg-gradient-to-br ${color} rounded-3xl p-8 border border-blue-50/40 group-hover:shadow-md transition-all duration-300 backdrop-blur-sm`}>
                {/* ステップ番号 */}
                <div className="absolute -top-4 left-8 w-8 h-8 bg-white rounded-full border-2 border-blue-100/60 flex items-center justify-center font-bold text-sm text-slate-700 shadow-sm">
                  {step}
                </div>
                
                <div className="space-y-4 pt-2">
                  <div className="w-12 h-12 mx-auto bg-white/60 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    {icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-14">
          <Link 
            href="/needs/new" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500/90 text-white font-semibold rounded-full hover:bg-blue-600/90 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            今すぐはじめてみる
          </Link>
        </div>
      </section>

      {/* 数字で見るNeedPort - 実績と信頼 */}
      <section className="mx-auto max-w-5xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">みんなで紡ぐ物語</h2>
          <p className="text-slate-600">
            小さな一歩が、大きな変化を生み出しています
          </p>
        </div>
        
        <div className="grid sm:grid-cols-4 gap-8">
          {[
            { number: "127", label: "投稿されたニーズ", desc: "困りごとから夢まで" },
            { number: "89", label: "マッチング成立", desc: "新しい出会いが生まれた数" },
            { number: "23", label: "参加地域", desc: "東京を中心に広がる輪" },
            { number: "156", label: "登録事業者", desc: "想いある事業者さんたち" }
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-3">
              <div className="text-4xl font-bold text-blue-600/80">{stat.number}</div>
              <div className="text-lg font-semibold text-slate-800">{stat.label}</div>
              <div className="text-sm text-slate-600 leading-relaxed">{stat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 心に響くメッセージ */}
      <section className="mx-auto max-w-4xl px-4">
        <div className="text-center bg-gradient-to-r from-blue-50/50 to-slate-50/70 rounded-3xl p-12 border border-blue-100/30">
          <blockquote className="text-xl sm:text-2xl text-slate-800 font-medium leading-relaxed mb-6">
            「一人では解決できないことも、<br className="hidden sm:block" />
            誰かと一緒なら、きっと道は見つかる」
          </blockquote>
          <div className="space-y-4">
            <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              NeedPortは、技術やサービスを超えた、人と人をつなぐ架け橋です。<br />
              あなたの小さな一歩が、誰かの大きな喜びになる瞬間を、<br />
              一緒に作っていきませんか。
            </p>
            <div className="pt-4">
              <Link 
                href="/needs/new" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white font-semibold rounded-full hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                あなたの物語を始める
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* フッター的な優しいメッセージ */}
      <section className="mx-auto max-w-3xl px-4 text-center">
        <div className="space-y-6 py-12 border-t border-blue-100/50">
          <div className="w-12 h-12 mx-auto bg-blue-100/60 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <p className="text-lg text-slate-700 font-medium">
            今日という日が、誰かの明日を輝かせる
          </p>
          <p className="text-sm text-slate-500 italic">
            NeedPort - 必要が港で出会う場所
          </p>
        </div>
      </section>
    </div>
  );
}