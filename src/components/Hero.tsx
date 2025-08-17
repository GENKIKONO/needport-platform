import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 text-white px-6 py-16 md:py-24">
      <div className="max-w-3xl mx-auto text-center">
        <div className="text-4xl md:text-6xl font-extrabold drop-shadow-sm">実現する力</div>
        <p className="mt-4 text-lg md:text-xl opacity-95">需要が見えるから、安心して提供できる。</p>
        <p className="mt-1 opacity-90">確実なニーズに基づくサービス創造</p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/post" className="btn btn-primary h-11 text-base">ニーズを投稿</Link>
          <Link href="/needs" className="btn btn-ghost h-11 text-base">みんなの「欲しい」</Link>
        </div>
      </div>
    </section>
  );
}
