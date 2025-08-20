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

      {/* 1.5. モバイルログイン2ボタン帯（SPのみ） */}
      <div className="lg:hidden np-fullbleed-left bg-white border-b">
        <div className="flex gap-2 p-4 mt-4">
          <a href="/signup" className="flex-1 bg-gradient-to-r from-[var(--np-blue-accent)] to-[var(--np-blue)] text-white text-center py-3 rounded-md font-semibold">
            一般ログイン
          </a>
          <a href="/vendor/register" className="flex-1 bg-white text-[var(--np-blue-accent)] border border-[var(--np-blue-accent)] text-center py-3 rounded-md font-semibold">
            事業者ログイン
          </a>
        </div>
      </div>

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


