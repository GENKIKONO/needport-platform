import Link from "next/link";
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
        <div className="flex gap-2 p-4">
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

      {/* 間隔をしっかり確保 */}
      <div className="h-6 md:h-10" />

      {/* 白背景を左右端まで */}
      <section className="np-white-bleed py-10">
        <FeaturedNeeds />
        <div className="mt-8 text-right">
          <Link href="/needs" className="inline-flex items-center px-5 py-3 font-semibold border-2 border-[var(--np-blue)] text-[var(--np-blue)] bg-white hover:bg-[var(--np-blue)] hover:text-white transition-all rounded-lg">
            一覧を見る
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
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


