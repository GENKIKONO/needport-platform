'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="mx-auto max-w-5xl p-4 pt-8">
      <div className="rounded-2xl bg-gradient-to-br from-indigo-700 via-blue-600 to-cyan-500 text-white shadow-lg">
        <div className="px-6 py-10 sm:px-10 sm:py-14">
          <div className="mb-5 flex items-center justify-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
              <span className="text-xl">⚓</span>
            </div>
          </div>

          <h1 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            NeedPortが描く未来
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-center text-white/90 leading-relaxed">
            人々の生活から生まれるリアルなニーズが、<br className="hidden sm:inline" />
            集まり、共鳴し、形になり、<br className="hidden sm:inline" />
            地方にも、全国にも、世界にも新しい価値を生む。
          </p>

          <div className="mx-auto mt-5 max-w-3xl rounded-xl bg-white/12 p-4 text-center text-white/90 ring-1 ring-white/20">
            それは、クラウドファンディングでも、BtoBマッチングでもない。<br className="hidden sm:inline" />
            「ニーズが出発点」の、新しい経済のかたち。
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/needs/new"
              className="inline-flex w-full items-center justify-center rounded-lg bg-white px-5 py-3 font-medium text-blue-700 shadow-sm transition hover:bg-blue-50 sm:w-auto"
              aria-label="ニーズを投稿する"
            >
              ✚ ニーズを投稿
            </Link>
            <Link
              href="/needs"
              className="inline-flex w-full items-center justify-center rounded-lg bg-white/10 px-5 py-3 font-medium text-white ring-1 ring-inset ring-white/40 transition hover:bg-white/15 sm:w-auto"
              aria-label="ニーズを探す"
            >
              🔎 ニーズを探す
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
