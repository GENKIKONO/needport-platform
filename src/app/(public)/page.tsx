import Link from "next/link";
import HeroCarousel from "@/components/hero/HeroCarousel";
import NeedsSearchPanel from "@/components/needs/NeedsSearchPanel";
import SearchTabs from "@/components/search/SearchTabs";
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
        <div className="flex gap-2 p-4">
          <a href="/signup" className="flex-1 bg-gradient-to-r from-[var(--np-blue-accent)] to-[var(--np-blue)] text-white text-center py-3 rounded-md font-semibold">
            一般ログイン
          </a>
          <a href="/vendor/register" className="flex-1 bg-white text-[var(--np-blue-accent)] border border-[var(--np-blue-accent)] text-center py-3 rounded-md font-semibold">
            事業者ログイン
          </a>
        </div>
      </div>

      {/* 2. ニーズ検索パネル（スクショ準拠） */}
      <NeedsSearchPanel defaultTab="search" />

      {/* 2.5. 企業・求人検索タブ */}
      <div className="mt-10">
        <SearchTabs />
      </div>

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


