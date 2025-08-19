import { getFlags } from '@/lib/admin/flags';
import Hero from '@/components/Hero';
import ServiceFlow from '@/components/ServiceFlow';
import HomeSoon from '@/components/HomeSoon';
import HomeCategories from '@/components/HomeCategories';
import HomeFeatured from '@/components/HomeFeatured';
import MarketingHero from '@/components/marketing/Hero';
import QuickLinks from '@/components/marketing/QuickLinks';
import BottomHeroCTA from '@/components/marketing/BottomHeroCTA';
import TopHero from '@/components/home/TopHero';
import HomeTabs from '@/components/home/HomeTabs';
import SupportServices from '@/components/home/SupportServices';
import AudiencePicker from '@/components/home/AudiencePicker';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const flags = await getFlags();

  return (
    <main className="space-y-12 bg-white">
      {/* トップヒーロー */}
      {flags.marketingHeroEnabled && <TopHero />}

      {/* 注目のニーズ - 必ず表示 */}
      <section className="section">
        <HomeFeatured />
      </section>

      {/* 投稿/探すタブ */}
      {flags.twoPanePublicEnabled && (
        <section className="section">
          <HomeTabs />
        </section>
      )}

      {/* 支援サービスセクション */}
      {flags.supportSectionEnabled && (
        <>
          <section className="section">
            <SupportServices />
          </section>
          <section className="section">
            <AudiencePicker />
          </section>
        </>
      )}

      {/* 既存のセクション */}
      {flags.marketingHeroEnabled && (
        <>
          <MarketingHero />
          <QuickLinks />
        </>
      )}

      {/* Hero (Existing) */}
      <section className="section">
        <Hero />
      </section>

      <div className="wave-divider"></div>

      {/* Flow：ここに集約（スマホ=カルーセル、PC=6カード+船） */}
      <section className="section">
        <ServiceFlow />
      </section>

      <div className="wave-divider"></div>

      {/* 既存セクション（必要に応じて見出しだけ少しだけ調整） */}
      <section className="section">
        <HomeSoon />
      </section>

      <div className="wave-divider"></div>

      <section className="section">
        <HomeCategories />
      </section>

      <div className="wave-divider"></div>

      {/* 下部ヒーローCTA */}
      {flags.marketingBottomHeroEnabled && <BottomHeroCTA />}
    </main>
  );
}
