"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="container-page h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="inline-block w-5 h-5 rounded bg-sky-600" aria-hidden />
            <span>NeedPort</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-5 text-sm text-slate-700">
          <Link href="/v2"               className="hover:text-sky-700">ホーム</Link>
          <Link href="/v2/needs"         className="hover:text-sky-700">ニーズ一覧</Link>
          <Link href="/v2/guide"         className="hover:text-sky-700">ガイド</Link>
          <Link href="/v2/news"          className="hover:text-sky-700">お知らせ</Link>
          <Link href="/me"               className="hover:text-sky-700">マイページ</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="px-3 py-1.5 text-sm border rounded hover:bg-slate-50">ログイン</Link>
          <Link href="/v2/needs/new" className="px-3 py-1.5 text-sm rounded bg-sky-600 text-white hover:bg-sky-700">ニーズを投稿</Link>
        </div>
      </div>
    </header>
  );
}
