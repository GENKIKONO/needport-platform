'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative border-b border-neutral-100 bg-white">
      <div className="container py-16 md:py-24 text-center">
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
          <Link href="/post" className="btn btn-primary h-11 text-base px-6">ニーズを投稿</Link>
          <Link href="/needs" className="btn btn-ghost h-11 text-base px-6">みんなの「欲しい」</Link>
        </div>
      </div>
    </section>
  );
}
