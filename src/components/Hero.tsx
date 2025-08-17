'use client'
import Link from 'next/link'
import { Anchor, Compass } from 'lucide-react'
import FlowStrip from './FlowStrip'
export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl hero-harbor sea-waves px-6 py-14 md:py-20">
      <div className="max-w-3xl mx-auto text-center">
        <div className="kicker justify-center text-harbor-500"><Compass className="w-4 h-4" /> 航海をはじめよう</div>
        <h1 className="mt-2 text-4xl md:text-6xl font-extrabold leading-tight text-balance">
          NeedPort は「ニーズの港」
        </h1>
        <p className="mt-4 text-lg md:text-xl text-neutral-600 text-balance">
          投稿 → 提案 → 承認 → ルーム → 安全な支払いまで、ここで完結。
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/post" className="btn btn-primary h-11 text-base whitespace-nowrap btn-wave"><Anchor className="w-4 h-4 mr-2"/>ニーズを投稿</Link>
          <Link href="/guide" className="btn btn-ghost h-11 text-base whitespace-nowrap">流れを見る</Link>
        </div>
        {/* 直感フロー（クラファン否定を言葉にしない） */}
        <div className="mt-6">
          <FlowStrip />
        </div>
      </div>
      <div className="wave-divider absolute bottom-0 left-0 right-0" />
    </section>
  )
}
