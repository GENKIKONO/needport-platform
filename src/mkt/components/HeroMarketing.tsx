import Link from "next/link";

export default function HeroMarketing(){
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-indigo-600 to-cyan-600 text-white px-6 py-16 md:py-24">
      {/* 薄い波 */}
      <svg className="absolute inset-0 opacity-10" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden>
        <path d="M0,250 C200,220 400,280 600,250 C800,220 1000,280 1200,250 L1200,400 0,400Z" fill="white"/>
      </svg>

      <div className="relative max-w-5xl mx-auto text-center">
        <h1 className="mt-2 text-4xl md:text-6xl font-extrabold leading-tight">NeedPort は「ニーズの港」</h1>
        <p className="mt-4 text-base sm:text-lg md:text-xl text-white/90">
          投稿→提案→承認→ルーム→安全な支払い。ここで完結。
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/post" className="btn btn-primary h-11 text-base">無料ではじめる</Link>
          <Link href="/guide" className="btn btn-ghost h-11 text-base text-white hover:bg-white/10">流れを見る</Link>
        </div>
        {/* ← Hero内に FlowStrip/ロゴ を置かない */}
      </div>
    </section>
  );
}
