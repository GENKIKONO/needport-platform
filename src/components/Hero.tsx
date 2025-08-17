'use client';

import Link from 'next/link';
import { Ship, Anchor, Compass } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl hero-harbor sea-waves px-6 py-16 md:py-24">
      {/* 港の装飾要素 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-8 left-8">
          <Anchor className="w-12 h-12 text-blue-600" />
        </div>
        <div className="absolute top-12 right-12">
          <Compass className="w-10 h-10 text-indigo-600" />
        </div>
        <div className="absolute bottom-8 left-16">
          <Ship className="w-8 h-8 text-cyan-600" />
        </div>
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        {/* キッカー */}
        <div className="kicker mb-4">
          <Ship className="w-4 h-4" />
          <span>ニーズの港 NeedPort</span>
        </div>

        <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight text-neutral-900">
          欲しい暮らし、10人で叶える。
        </h1>
        <p className="mt-6 text-base md:text-lg text-neutral-600">
          ひとりの「欲しい」が重なると、企業が動く。
        </p>
        <p className="mt-1 text-neutral-600">
          NeedPortは「欲しい」と「できる」をつなぐ <span className="font-semibold">ニーズの港</span> です。
        </p>

        <div className="mt-10 flex items-center justify-center gap-3">
          <Link href="/post" className="btn btn-primary h-11 text-base px-6 btn-wave">ニーズを投稿</Link>
          <Link href="/needs" className="btn btn-ghost h-11 text-base px-6">みんなの「欲しい」</Link>
        </div>
      </div>

      {/* 波の区切り */}
      <div className="wave-divider absolute bottom-0 left-0 right-0" />
    </section>
  );
}
