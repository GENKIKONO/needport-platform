import Link from "next/link";
import HeroCarousel from "@/components/hero/HeroCarousel";
import NeedsUnifiedPanel from "@/components/needs/NeedsUnifiedPanel";
import AudiencePicker from "@/components/home/AudiencePicker";
import FeaturedNeeds from "@/components/home/FeaturedNeeds";
import BottomHeroCTA from "@/components/home/BottomHeroCTA";
import NewsList from "@/components/home/NewsList";

export default function Home() {
  return (
    <>
      {/* 1. ヒーローセクション */}
      <HeroCarousel />

      {/* 2. ニーズ検索パネル（一枚板アーキテクチャ） */}
      <NeedsUnifiedPanel />

      {/* 3. オーディエンスピッカー（ユーザ別おすすめ） */}
      <AudiencePicker />

      {/* 間隔をしっかり確保 */}
      <div className="h-6 md:h-10" />

      {/* 白背景を左右端まで */}
      <section className="np-white-bleed py-10">
        <FeaturedNeeds />
      </section>

      {/* 5. 下部ヒーローCTA（フッター直前の再CV） */}
      <div className="np-white-bleed py-12">
        <BottomHeroCTA />
      </div>

      {/* 6. お知らせ（ページ下の方） */}
      <NewsList />
    </>
  );
}


