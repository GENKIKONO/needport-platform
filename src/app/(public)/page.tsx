import Hero from "@/components/Hero";
import PageHeader from "@/components/PageHeader";
import HomeSoon from "@/components/HomeSoon";
import HomeCategories from "@/components/HomeCategories";
import HomeFeatured from "@/components/HomeFeatured";
import FlowCarousel from "@/components/FlowCarousel";
import VisionCard from "@/components/VisionCard";

export const dynamic = "force-dynamic"; 
export const revalidate = 0;

export default async function Home(){
  return (
    <main className="space-y-12 bg-white">
      {/* Hero */}
      <section className="section">
        <Hero />
        {/* ヒーロー直下で"クラファンではない"を軽く補足 */}
        <p className="mt-4 text-center text-neutral-500 text-sm">
          ※ NeedPortはクラウドファンディングではありません。人数は需要の可視化です。
        </p>
      </section>

      {/* 新規：サービスの流れ（横カルーセル） */}
      <FlowCarousel />

            {/* 既存：いま動き出しているニーズ（旧 もうすぐ成立） */}
      <section className="rounded-2xl bg-gradient-to-b from-amber-50 to-white">
        <div className="section">
          <PageHeader
            title="いま動き出しているニーズ"
            description="関心が集まってきている投稿です"
            badge="HOT"
          />
          <HomeSoon />
        </div>
      </section>

      {/* カテゴリー */}
      <section className="section">
        <PageHeader 
          title="どんなニーズがありますか？" 
          description="カテゴリーからニーズを探す"
        />
        <HomeCategories />
      </section>

      {/* 既存：注目ニーズ */}
      <section className="section">
        <PageHeader 
          title="注目のニーズ" 
          description="最新のニーズをご紹介"
        />
        <HomeFeatured />
      </section>

      {/* 新規：ビジョンカード（青グラデ） */}
      <VisionCard />
    </main>
  );
}
