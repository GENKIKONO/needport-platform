import HeroMain from "@/components/hero/HeroMain";
import DualActionPanel from "@/components/home/DualActionPanel";
import AudiencePicker from "@/components/home/AudiencePicker";
import FeaturedNeeds from "@/components/home/FeaturedNeeds";
import FeaturesCarousel from "@/components/home/FeaturesCarousel";
import BottomHeroCTA from "@/components/home/BottomHeroCTA";
import NewsList from "@/components/home/NewsList";

export default function Home() {
  return (
    <>
      {/* 1. ヒーローセクション */}
      <HeroMain />

      {/* 2. タブ切替＋検索/投稿パネル（2分割色ブロック） */}
      <DualActionPanel />

      {/* 3. オーディエンスピッカー（ユーザ別おすすめ） */}
      <AudiencePicker />

      {/* 4. 注目のニーズ（カード列＋メーター表示） */}
      <FeaturedNeeds />

      {/* 5. 動画・記事（使い方動画 / 成功事例記事 / 事業者インタビュー） */}
      <FeaturesCarousel />

      {/* 6. 下部ヒーローCTA（フッター直前の再CV） */}
      <BottomHeroCTA />

      {/* 7. お知らせ（ページ下の方） */}
      <NewsList />
    </>
  );
}


