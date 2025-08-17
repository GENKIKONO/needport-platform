import MktHeader from "@/mkt/components/MktHeader";
import HeroMarketing from "@/mkt/components/HeroMarketing";
import ValueGrid from "@/mkt/components/ValueGrid";
import StepsStrip from "@/mkt/components/StepsStrip";
import CompareNotCrowd from "@/mkt/components/CompareNotCrowd";
import SocialProof from "@/mkt/components/SocialProof";
import CTAbar from "@/mkt/components/CTAbar";
import MktFooter from "@/mkt/components/MktFooter";

export const metadata = {
  title: "NeedPort - ニーズの港 | リアルな困りごとと業者の提案を安全に成立",
  description: "クラファンではなく、リアルなニーズと業者の提案を安全に成立させるプラットフォーム。投稿→提案→承認→ルーム→安全な支払いまで、この場で完結。",
};

export default function MarketingPage() {
  return (
    <>
      <MktHeader />
      <main className="space-y-12 bg-white pb-20">
        <HeroMarketing />
        <ValueGrid />
        <StepsStrip />
        <CompareNotCrowd />
        <SocialProof />
      </main>
      <MktFooter />
      <CTAbar />
    </>
  );
}
