import HeroMain from "@/components/hero/HeroMain";
import DualActionPanel from "@/components/home/DualActionPanel";
import ShortcutGrid from "@/components/home/ShortcutGrid";
import PromoSlider from "@/components/home/PromoSlider";
import NewsList from "@/components/home/NewsList";
import EventsGrid from "@/components/home/EventsGrid";
import FeaturesCarousel from "@/components/home/FeaturesCarousel";
import BottomHeroCTA from "@/components/home/BottomHeroCTA";
import SupportServices from "@/components/home/SupportServices";
import FeaturedNeeds from "@/components/home/FeaturedNeeds";

export default function Home() {
  return (
    <>
      {/* 1. HeroMain（大ビジュアル＋コピー＋小告知バナー） */}
      <HeroMain />

      {/* 2. DualActionPanel（色ブロックで「ニーズを探す / ニーズを投稿」切替・遷移なし） */}
      <DualActionPanel />

      {/* 3. ShortcutGrid（6枚のショートカット） */}
      <ShortcutGrid />

      {/* 4. PromoSlider（横長バナー） */}
      <PromoSlider />

      {/* 5. NewsList（お知らせ5件＋一覧へ） */}
      <NewsList />

      {/* 6. EventsGrid（イベント/特集カード） */}
      <EventsGrid />

      {/* 仙台風支援サービス */}
      <SupportServices />

      {/* 注目のニーズ */}
      <FeaturedNeeds />

      {/* 7. FeaturesCarousel（動画/記事） */}
      <FeaturesCarousel />

      {/* 8. BottomHeroCTA（再CV） */}
      <BottomHeroCTA />
    </>
  );
}


