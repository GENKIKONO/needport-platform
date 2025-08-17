import HeroMarketing from "@/mkt/components/HeroMarketing";
import FlowStrip from "@/components/FlowStrip";

export default function MktPage(){
  return (
    <main className="space-y-12">
      <section className="container pt-10"><HeroMarketing/></section>
      <section className="container"><FlowStrip /></section>
      {/* 以降のセクション … */}
    </main>
  );
}
