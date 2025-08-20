import HomeTabs from "@/components/home/HomeTabs";
import { getFlags } from "@/lib/admin/flags";
import ServiceFlow from '@/components/ServiceFlow';
import HomeSoon from '@/components/HomeSoon';
import HomeCategories from '@/components/HomeCategories';
import HomeFeatured from '@/components/HomeFeatured';
import Image from 'next/image';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const flags = await getFlags();
  const heroImage = "/hero.jpg"; // 固定でhero.jpgを使用

  return (
    <>
      <section className="mt-2">
        <div className={`rounded-2xl overflow-hidden ${heroImage ? "bg-cover bg-center" : "bg-gray-300"}`}
             style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}>
          <div className="px-6 py-10 md:px-10 md:py-14 bg-black/0">
            <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow">NeedPortが描く未来</h1>
            <p className="mt-3 max-w-2xl text-white/90">
              生活から生まれるリアルなニーズが集まり、共鳴し、形になる。
            </p>
            <div className="mt-6 flex gap-4">
              <a className="rounded bg-sky-600 text-white px-4 py-2" href="/needs/new">ニーズを投稿</a>
              <a className="rounded bg-white/90 text-sky-700 px-4 py-2" href="/needs">ニーズを探す</a>
            </div>
          </div>
        </div>
      </section>

      <HomeTabs />

      {/* 以降：支援サービス、オーディエンス、注目のニーズ（既存を再配置） */}
      <section className="section">
        <SupportServices />
      </section>
      
      <section className="section">
        <AudiencePicker />
      </section>
      
      <section className="section">
        <header className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">注目のニーズ</h2>
          <p className="text-gray-600">関心が高い投稿をピックアップ</p>
        </header>
        <HomeFeatured />
      </section>
    </>
  );
}

// 支援サービスセクション（簡易版）
function SupportServices() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">NeedPort支援サービス</h2>
        <p className="text-lg text-gray-600">あなたのニーズ実現をサポートします</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            id: 'posting',
            title: 'はじめての投稿を、かんたんに。',
            description: 'テンプレと事例で迷わず公開まで。',
            cta: '投稿のコツを見る',
            href: '/guide/posting',
            color: 'bg-green-50 border-green-200'
          },
          {
            id: 'offer',
            title: '見つけて、提案して、つながる。',
            description: '登録→検索→提案→見積の流れを解説。',
            cta: '提案フローを見る',
            href: '/guide/offer',
            color: 'bg-orange-50 border-orange-200'
          },
          {
            id: 'consultation',
            title: '使い方・安全・トラブル、お気軽に。',
            description: 'フォームからご相談ください。',
            cta: '相談する',
            href: '/support',
            color: 'bg-blue-50 border-blue-200'
          }
        ].map((service) => (
          <div
            key={service.id}
            className={`rounded-xl border-2 p-6 transition-all hover:shadow-lg ${service.color}`}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{service.title}</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {service.description}
            </p>
            <a
              href={service.href}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {service.cta}
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

// オーディエンス切替（簡易版）
function AudiencePicker() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">あなたはどちらですか？</h2>
        <p className="text-gray-600">対象に応じたおすすめコンテンツをご案内します</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { id: 'consumer', label: '生活者の方', description: 'ニーズを探して賛同する' },
          { id: 'vendor', label: '事業者の方', description: 'サービスを提供する' },
          { id: 'gov', label: '自治体の方', description: '地域の課題を解決する' },
          { id: 'ally', label: '支援者の方', description: 'プロジェクトを支援する' }
        ].map((audience) => (
          <button
            key={audience.id}
            className="p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 transition-all hover:shadow-md"
          >
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-1">{audience.label}</h3>
              <p className="text-sm text-gray-600">{audience.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// 下部ヒーローCTA（可読性修正済み）
function BottomHeroCTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 mt-16">
      <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-sky-600 to-cyan-500 text-white px-6 py-10 md:px-10 md:py-14 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold">NeedPortが描く未来へ、いま出港。</h2>
        <p className="mt-2 text-white/90">リアルな「欲しい」を集め、共創し、形にする。あなたの一歩が、次の価値を生みます。</p>
        <div className="mt-6 flex gap-3 flex-wrap">
          <a href="/needs/new" className="inline-flex items-center gap-2 rounded-xl bg-white text-sky-700 px-4 py-2 font-semibold shadow hover:shadow-md transition-shadow">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            ニーズを投稿
          </a>
          <a href="/needs" className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 text-white px-4 py-2 font-semibold hover:bg-white/20 transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            ニーズを探す
          </a>
        </div>
      </div>
    </section>
  );
}
