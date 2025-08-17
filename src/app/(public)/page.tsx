import HeroPorts from "@/components/HeroPorts";
import ServiceFlowCarousel from "@/components/ServiceFlowCarousel";
import PageHeader from "@/components/PageHeader";
import HomeSoon from "@/components/HomeSoon";
import HomeCategories from "@/components/HomeCategories";
import HomeFeatured from "@/components/HomeFeatured";
import FlowCarousel from "@/components/FlowCarousel";
import VisionCard from "@/components/VisionCard";
import FlowRail from "@/components/FlowRail";
import Hero from "@/components/Hero";
import FlowStrip from "@/components/FlowStrip";

export const dynamic = "force-dynamic"; 
export const revalidate = 0;

export default async function Home(){
  return (
    <main className="space-y-12 bg-white">
      {/* Hero with interactive ports */}
      <section className="section">
        <Hero />
      </section>

      {/* 船アニメ航路（説明はアイコンのみ） */}
      <section className="section pt-0">
        <div className="max-w-4xl mx-auto">
          <FlowStrip />
        </div>
      </section>

      {/* 新規：サービスの流れ（横カルーセル） */}
      <ServiceFlowCarousel />

            {/* 既存：提案が集まっているニーズ */}
      <section className="rounded-2xl bg-gradient-to-b from-amber-50 to-white">
        <div className="section">
          <PageHeader
            title="提案が集まっているニーズ"
            description="業者からの提案が届いている投稿です"
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
