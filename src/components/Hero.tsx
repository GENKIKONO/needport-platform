import Link from 'next/link'
export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl hero-mint px-6 py-16 md:py-24">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-balance">実現する力</h1>
        <p className="mt-5 text-lg md:text-xl text-neutral-700 leading-relaxed text-balance">
          需要が見えるから、安心して提供できる。<br className="hidden sm:block"/>
          確実なニーズに基づくサービス創造
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/post" className="btn btn-primary h-11 text-base whitespace-nowrap">ニーズを投稿</Link>
          <Link href="/needs" className="btn btn-ghost h-11 text-base whitespace-nowrap">みんなの「欲しい」</Link>
        </div>
      </div>
    </section>
  )
}
