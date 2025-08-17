'use client'
import Link from 'next/link'
import { Anchor, Compass } from 'lucide-react'
export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl hero-harbor sea-waves px-6 py-16 md:py-24">
      <div className="max-w-3xl mx-auto text-center">
        <div className="kicker justify-center text-harbor-500"><Compass className="w-4 h-4" /> 航海をはじめよう</div>
        <h1 className="mt-2 text-4xl md:text-6xl font-extrabold leading-tight text-balance">実現する力</h1>
        <p className="mt-4 text-lg md:text-xl text-neutral-700 leading-relaxed text-balance">
          需要が見えるから、安心して提供できる。確実なニーズに基づくサービス創造
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/post" className="btn btn-primary h-11 text-base whitespace-nowrap btn-wave"><Anchor className="w-4 h-4 mr-2"/>ニーズを投稿</Link>
          <Link href="/needs" className="btn btn-ghost h-11 text-base whitespace-nowrap">みんなの「欲しい」</Link>
        </div>
      </div>
      <div className="wave-divider absolute bottom-0 left-0 right-0" />
    </section>
  )
}
