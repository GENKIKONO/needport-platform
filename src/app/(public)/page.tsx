import HeroMain from "@/components/hero/HeroMain";
import DualActionPanel from "@/components/home/DualActionPanel";
import FeaturesCarousel from "@/components/home/FeaturesCarousel";
import FeaturedNeeds from "@/components/home/FeaturedNeeds";
import NewsList from "@/components/home/NewsList";

export default function Home() {
  return (
    <>
      {/* 1. ヒーローセクション */}
      <HeroMain />

      {/* 2. タブ切替＋検索/投稿パネル（2分割色ブロック） */}
      <DualActionPanel />

      {/* 3. 動画・記事（使い方動画 / 成功事例記事 / 事業者インタビュー） */}
      <FeaturesCarousel />

      {/* 4. 注目のニーズ（カード列＋メーター表示） */}
      <FeaturedNeeds />

      {/* 5. お知らせ（ページ下の方） */}
      <NewsList />
    </>
  );
}


