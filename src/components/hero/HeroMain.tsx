import Image from "next/image";
import HeroNoticeBanner from "./HeroNoticeBanner";

export default function HeroMain() {
  return (
    <section className="relative overflow-hidden pt-[var(--header-mobile)] lg:pt-0">
      {/* 背景画像 */}
      <div className="absolute inset-0 -z-10">
        <Image src="/hero/home.jpg" alt="" fill className="object-cover bg-center" />
        <div className="absolute inset-0 bg-white/55 backdrop-blur-sm" />
      </div>
      
      {/* メインコンテンツ */}
      <div className="max-w-6xl mx-auto px-4 py-12 lg:py-16">
        <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight">
          運命のニーズは、ここにある。
        </h1>
        <p className="mt-3 text-slate-700">
          生活から生まれるリアルなニーズが集まり、共鳴し、形になるプラットフォーム。
        </p>
        <div className="mt-6 flex gap-3">
          <a className="px-5 py-3 rounded-md bg-sky-600 text-white hover:bg-sky-700 transition-colors" href="/needs">
            ニーズを探す
          </a>
          <a className="px-5 py-3 rounded-md bg-white ring-1 ring-slate-200 text-sky-700 hover:bg-slate-50 transition-colors" href="/post">
            ニーズを投稿
          </a>
        </div>
      </div>
      
      {/* 告知バナー */}
      <HeroNoticeBanner />
    </section>
  );
}
