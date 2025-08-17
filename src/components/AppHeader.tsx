"use client";
import Link from "next/link";
export default function AppHeader(){
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-neutral-900/60 border-b border-black/5">
      <div className="container flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">⛵</span>
          NeedPort
        </Link>
        <nav className="hidden md:flex items-center gap-2">
          <Link className="btn btn-ghost" href="/needs">みんなの「欲しい」</Link>
          <Link className="btn btn-ghost" href="/services">企業の「できる」</Link>
          <Link className="btn btn-ghost" href="/guide">サービス航海図</Link>
        </nav>
      </div>
    </header>
  );
}
