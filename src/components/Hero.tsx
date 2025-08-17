'use client'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative rounded-2xl hero-mint px-6 py-16 md:py-24">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-balance">
          NeedPort は「ニーズの港」
        </h1>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/post" className="btn btn-primary h-11 whitespace-nowrap">ニーズを投稿</Link>
          <Link href="/needs" className="btn btn-ghost h-11 whitespace-nowrap">ニーズを見る</Link>
        </div>
      </div>
    </section>
  );
}
