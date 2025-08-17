import MktHeader from "@/mkt/components/MktHeader";
import HeroMarketing from "@/mkt/components/HeroMarketing";
import ValueGrid from "@/mkt/components/ValueGrid";
import StepsStrip from "@/mkt/components/StepsStrip";
import SocialProof from "@/mkt/components/SocialProof";
import CTAbar from "@/mkt/components/CTAbar";
import MktFooter from "@/mkt/components/MktFooter";
import FlowStrip from "@/components/FlowStrip";

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
        
        {/* 船アニメ航路（1つだけ） */}
        <section className="section pt-0">
          <div className="max-w-5xl mx-auto">
            <FlowStrip />
          </div>
        </section>
        
        <ValueGrid />
        <StepsStrip />
        <SocialProof />
      </main>
      <MktFooter />
      <CTAbar />
    </>
  );
}
