import Image from "next/image";
import FukushimaSwitch from "@/components/home/FukushimaSwitch";
import SupportServices from "@/components/home/SupportServices";
import AudiencePicker from "@/components/home/AudiencePicker";
import FeaturedNeeds from "@/components/home/FeaturedNeeds";

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image src="/hero/home.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-white/55 backdrop-blur-sm" />
        </div>
        <div className="max-w-6xl mx-auto px-4 py-12 lg:py-16">
          <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight">
            運命のニーズは、ここにある。
          </h1>
          <p className="mt-3 text-slate-700">
            生活から生まれるリアルなニーズが集まり、共鳴し、形になるプラットフォーム。
          </p>
          <div className="mt-6 flex gap-3">
            <a className="px-5 py-3 rounded-md bg-sky-600 text-white" href="/post">ニーズを投稿</a>
            <a className="px-5 py-3 rounded-md bg-white ring-1 ring-slate-200 text-sky-700" href="/needs">
              ニーズを探す
            </a>
          </div>
        </div>
      </section>

      {/* 2分割"色ブロック"：ページ遷移なし */}
      <section className="py-10">
        <FukushimaSwitch />
      </section>

      {/* 仙台風：支援サービス3枚 */}
      <section className="py-12 bg-slate-50">
        <SupportServices />
      </section>

      {/* オーディエンス */}
      <section className="py-12">
        <AudiencePicker />
      </section>

      {/* 注目のニーズ */}
      <section className="py-12 bg-white">
        <FeaturedNeeds />
      </section>
    </>
  );
}


