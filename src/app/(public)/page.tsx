import { getFlags } from '@/lib/admin/flags';
import Hero from '@/components/Hero';
import ServiceFlow from '@/components/ServiceFlow';
import HomeSoon from '@/components/HomeSoon';
import HomeCategories from '@/components/HomeCategories';
import HomeFeatured from '@/components/HomeFeatured';
import MarketingHero from '@/components/marketing/Hero';
import QuickLinks from '@/components/marketing/QuickLinks';

export const dynamic = "force-dynamic"; 
export const revalidate = 0;

export default async function Home(){
  const flags = await getFlags();

  return (
    <main className="space-y-12 bg-white">
      {/* Marketing Hero (フラグでON/OFF) */}
      {flags.marketingHeroEnabled !== false && (
        <>
          <MarketingHero />
          <QuickLinks />
        </>
      )}

      {/* Hero */}
      <section className="section">
        <Hero />
      </section>

      {/* Flow：ここに集約（スマホ=カルーセル、PC=6カード+船） */}
      <section className="section">
        <ServiceFlow />
      </section>

      {/* 既存セクション（必要に応じて見出しだけ少しだけ調整） */}
      <section className="section">
        <header className="mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-neutral-900">もうすぐ成立</h2>
          <p className="text-neutral-600">あと少しで実現！いま参加しよう</p>
        </header>
        <HomeSoon />
      </section>

      <section className="section">
        <header className="mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-neutral-900">どんなニーズがありますか？</h2>
          <p className="text-neutral-600">カテゴリーから探す</p>
        </header>
        <HomeCategories />
      </section>

      <section className="section">
        <header className="mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-neutral-900">注目のニーズ</h2>
          <p className="text-neutral-600">関心が高い投稿をピックアップ</p>
        </header>
        <HomeFeatured />
      </section>
    </main>
  );
}
