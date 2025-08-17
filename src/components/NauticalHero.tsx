import Link from "next/link";
import { Anchor, Ship, LifeBuoy, Navigation, MapPin } from "lucide-react";

export default function NauticalHero() {
  return (
    <section className="relative hero-ocean px-6 py-14 md:py-20">
      {/* --- decorative motifs (aria-hidden) --- */}
      <Navigation aria-hidden className="decoration absolute left-6 top-6 w-28 h-28 text-sky-800/10" />
      <Ship aria-hidden className="decoration absolute right-10 top-16 w-10 h-10 text-sky-900/15" />
      {/* dotted route line */}
      <svg aria-hidden className="decoration absolute inset-x-0 top-24 h-8" viewBox="0 0 800 64" fill="none">
        <path d="M20,40 C160,10 300,58 440,28 S680,10 780,34" stroke="currentColor" className="text-sky-900/10"
              strokeWidth="2" strokeDasharray="4 8" strokeLinecap="round"/>
      </svg>

      {/* content */}
      <div className="max-w-3xl mx-auto text-center">
        <div className="step-kicker justify-center">
          <Anchor className="w-4 h-4" />
          あなたの「欲しい」へ導くナビゲーション
        </div>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-900 text-balance">
          NeedPort サービス航海図
        </h1>
        <p className="mt-3 text-neutral-700 text-balance">
          初めての方も、慣れた方も。安全で快適な航海のための完全ガイド
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/post" className="btn btn-primary h-11 whitespace-nowrap">あなたの「欲しい」を投稿</Link>
          <Link href="/needs" className="btn btn-ghost h-11 whitespace-nowrap">みんなの「欲しい」</Link>
        </div>
      </div>

      {/* wave divider bottom */}
      <svg className="wave-svg" viewBox="0 0 800 48" preserveAspectRatio="none" aria-hidden>
        <path d="M0,24 C120,48 240,0 360,24 C480,48 600,0 800,24 V48 H0 Z" fill="#fff"/>
      </svg>
    </section>
  );
}
