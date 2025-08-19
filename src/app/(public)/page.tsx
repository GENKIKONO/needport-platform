import Hero from '@/components/Hero';
import ServiceFlow from '@/components/ServiceFlow';
import HomeSoon from '@/components/HomeSoon';
import HomeCategories from '@/components/HomeCategories';
import HomeFeatured from '@/components/HomeFeatured';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  return (
    <main className="space-y-12 bg-white">
      {/* 注目のニーズ - 必ず表示 */}
      <section className="section">
        <HomeFeatured />
      </section>

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
    </main>
  );
}
