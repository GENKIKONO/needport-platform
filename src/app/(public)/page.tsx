import Image from "next/image";
import HomeTabs from "@/components/home/HomeTabs";
import SupportServices from "@/components/home/SupportServices";
import AudiencePicker from "@/components/home/AudiencePicker";
import FeaturedNeeds from "@/components/home/FeaturedNeeds";

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative">
        <div className="hidden lg:block absolute inset-0 -z-10">
          <Image src="/hero/home.jpg" alt="" fill className="object-cover opacity-90" />
        </div>
        <div className="lg:bg-white/70 lg:backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-10 lg:py-16">
            <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight">NeedPortが描く未来</h1>
            <p className="mt-3 text-slate-600">生活から生まれるリアルなニーズが集まり、共鳴し、形になる。</p>
            <div className="mt-6 flex gap-3">
              <a className="px-5 py-3 rounded-md bg-sky-600 text-white" href="/post">ニーズを投稿</a>
              <a className="px-5 py-3 rounded-md bg-white ring-1 ring-slate-200 text-sky-700" href="/needs">ニーズを探す</a>
            </div>
          </div>
        </div>
      </section>

      {/* TABS */}
      <div className="py-10"><HomeTabs /></div>

      {/* SUPPORT 3 CARDS */}
      <div className="py-12 bg-slate-50"><SupportServices /></div>

      {/* AUDIENCE */}
      <div className="py-12"><AudiencePicker /></div>

      {/* FEATURED */}
      <div className="py-12 bg-white"><FeaturedNeeds /></div>
    </>
  );
}


