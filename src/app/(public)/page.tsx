import HeroPorts from "@/components/HeroPorts";
import ServiceFlowCarousel from "@/components/ServiceFlowCarousel";
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
      {/* Hero with interactive ports */}
      <section className="section">
        <HeroPorts />
      </section>

      {/* 流れ（クラファンと誤解されないように直感表示） */}
      <section className="section pt-0">
        <div className="mx-auto max-w-4xl np-card p-4 sm:p-6">
          <div className="flex items-center gap-3 text-blue-600 font-medium mb-2">
            <span className="i-lucide-anchor w-5 h-5" />
            <span>ニーズの港 NeedPort の流れ</span>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center text-sm text-neutral-600">
            <div><div className="i-lucide-file-text mx-auto w-6 h-6 mb-1" />投稿</div>
            <div><div className="i-lucide-handshake mx-auto w-6 h-6 mb-1" />提案</div>
            <div><div className="i-lucide-shield-check mx-auto w-6 h-6 mb-1" />承認</div>
            <div><div className="i-lucide-square mx-auto w-6 h-6 mb-1" />ルーム</div>
            <div><div className="i-lucide-credit-card mx-auto w-6 h-6 mb-1" />支払い</div>
          </div>
          <p className="mt-3 text-center text-neutral-500 text-sm">良い提案だけを承認して前進。</p>
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
