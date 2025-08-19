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

      {/* 背景装飾レイヤー - 飛行機 */}
      <svg className="absolute inset-0 pointer-events-none opacity-10" aria-hidden="true">
        <defs>
          <symbol id="plane" viewBox="0 0 24 24">
            <path fill="currentColor" d="M2 12l20-6-4 6 4 6-20-6 6-2-1-3 3 1 2-1-2-1-3 1 1-3z"/>
          </symbol>
        </defs>
        <use href="#plane" x="10%" y="20%" className="text-sky-700" />
        <use href="#plane" x="70%" y="60%" className="text-sky-600" />
      </svg>

      <div className="relative max-w-3xl mx-auto text-center">
        {/* キッカー */}
        <div className="kicker mb-4">
          <Ship className="w-4 h-4" />
          <span>ニーズの港 NeedPort</span>
        </div>

        <h1 className="text-3xl md:text-[56px] font-extrabold tracking-[-0.02em] text-neutral-900 md:whitespace-nowrap">
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
