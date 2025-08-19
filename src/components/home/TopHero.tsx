'use client';

import Link from 'next/link';

export default function TopHero() {
  return (
    <section className="mx-auto max-w-6xl p-6 pt-8">
      <div className="rounded-2xl bg-gradient-to-br from-indigo-700 via-blue-600 to-cyan-500 text-white shadow-lg">
        <div className="px-6 py-12 sm:px-10 sm:py-16">
          <div className="mb-6 flex items-center justify-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
              <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <h1 className="text-center text-4xl font-bold tracking-tight sm:text-5xl">
            NeedPortが描く未来
          </h1>

          <p className="mx-auto mt-6 max-w-4xl text-center text-white/90 leading-relaxed text-lg">
            人々の生活から生まれるリアルなニーズが、<br className="hidden sm:inline" />
            集まり、共鳴し、形になり、<br className="hidden sm:inline" />
            地方にも、全国にも、世界にも新しい価値を生む。
          </p>

          <div className="mx-auto mt-6 max-w-4xl rounded-xl bg-white/12 p-6 text-center text-white/90 ring-1 ring-white/20">
            それは、クラウドファンディングでも、BtoBマッチングでもない。<br className="hidden sm:inline" />
            「ニーズが出発点」の、新しい経済のかたち。
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/needs/new"
              className="inline-flex w-full items-center justify-center rounded-lg bg-white px-6 py-4 font-medium text-blue-700 shadow-sm transition hover:bg-blue-50 sm:w-auto text-lg"
              aria-label="ニーズを投稿する"
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              ニーズを投稿
            </Link>
            <Link
              href="#search-tab"
              className="inline-flex w-full items-center justify-center rounded-lg bg-white/10 px-6 py-4 font-medium text-white ring-1 ring-inset ring-white/40 transition hover:bg-white/15 sm:w-auto text-lg"
              aria-label="ニーズを探す"
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              ニーズを探す
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
