import HeroCarousel from "@/components/hero/HeroCarousel";
import DualActionPanel from "@/components/home/DualActionPanel";
import AudiencePicker from "@/components/home/AudiencePicker";
import FeaturedNeeds from "@/components/home/FeaturedNeeds";
import BottomHeroCTA from "@/components/home/BottomHeroCTA";
import NewsList from "@/components/home/NewsList";

export default function Home() {
  return (
    <>
      {/* 1. ヒーローセクション */}
      <HeroCarousel />

      {/* 2. タブ切替＋検索/投稿パネル（2分割色ブロック） */}
      <DualActionPanel />

      {/* 3. オーディエンスピッカー（ユーザ別おすすめ） */}
      <AudiencePicker />

      {/* 4. 注目のニーズ（カード列＋メーター表示） */}
      <FeaturedNeeds />

      {/* 5. 下部ヒーローCTA（フッター直前の再CV） */}
      <BottomHeroCTA />

      {/* 6. お知らせ（ページ下の方） */}
      <NewsList />
    </>
  );
}


