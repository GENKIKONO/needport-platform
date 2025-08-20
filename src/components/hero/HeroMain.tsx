import Image from "next/image";
import HeroNoticeBanner from "./HeroNoticeBanner";

export default function HeroMain() {
  return (
    <section className="relative overflow-hidden pt-[var(--header-mobile)] lg:pt-0">
      {/* 背景画像 */}
      <div className="absolute inset-0 -z-10">
        <Image 
          src="/hero/home.jpg" 
          alt="NeedPortヒーロー画像" 
          fill 
          className="object-cover bg-center" 
          priority
        />
        <div className="absolute inset-0 bg-white/55 backdrop-blur-sm" />
      </div>
      
      {/* メインコンテンツ */}
      <div className="max-w-6xl mx-auto px-4 py-12 lg:py-16">
        <div className="relative">
          {/* 福島型の地図風シェイプ */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg transform rotate-3 scale-105 opacity-20"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-lg p-8 lg:p-12 border-2 border-amber-400 shadow-xl">
              <h1 className="text-[var(--h1)] font-bold text-[var(--ink-900)] tracking-tight">
                運命のニーズは、ここにある。
              </h1>
              <p className="mt-4 text-[var(--lead)] text-[var(--ink-700)] leading-relaxed">
                生活から生まれるリアルなニーズが集まり、共鳴し、形になるプラットフォーム。
              </p>
            </div>
          </div>
        </div>
        
        {/* CTAボタン */}
        <div className="mt-8 lg:mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-700)] text-white font-semibold text-lg hover:opacity-95 transition-all shadow-[var(--elev-1)] hover:shadow-[var(--elev-2)]" 
            href="/post"
          >
            ニーズを投稿
          </a>
          <a 
            className="px-8 py-4 rounded-xl bg-white border-2 border-[var(--blue-600)] text-[var(--blue-700)] font-semibold text-lg hover:bg-[var(--blue-100)] transition-all shadow-[var(--elev-1)] hover:shadow-[var(--elev-2)]" 
            href="/needs"
          >
            ニーズを探す
          </a>
        </div>
      </div>
      
      {/* 告知バナー */}
      <HeroNoticeBanner />
    </section>
  );
}
