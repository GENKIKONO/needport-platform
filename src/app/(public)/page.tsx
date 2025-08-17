import Hero from "@/components/Hero";
import PageHeader from "@/components/PageHeader";
import HomeSoon from "@/components/HomeSoon";
import HomeCategories from "@/components/HomeCategories";
import HomeFeatured from "@/components/HomeFeatured";

export const dynamic = "force-dynamic"; 
export const revalidate = 0;

export default async function Home(){
  return (
    <main className="space-y-12 bg-white">
      {/* Hero */}
      <section className="section">
        <Hero />
      </section>

            {/* Soon (灯台カラーを少し入れる) */}
      <section className="rounded-2xl bg-gradient-to-b from-sand-50 to-white">
        <div className="section">
          <PageHeader
            title="もうすぐ成立"
            description="あと少しで実現！今すぐ参加しよう"
            badge="灯台"
          />
          <HomeSoon />
        </div>
      </section>

      {/* カテゴリー */}
      <section className="section">
        <PageHeader 
          title="どんなニーズがありますか？" 
          description="カテゴリーからニーズを探す"
        />
        <HomeCategories />
      </section>

      {/* 注目のニーズ */}
      <section className="section">
        <PageHeader 
          title="注目のニーズ" 
          description="最新のニーズをご紹介"
        />
        <HomeFeatured />
      </section>
    </main>
  );
}
