"use client";
import { useState } from "react";
import Link from "next/link";
import { useActive } from "@/app/(ui2)/_lib/nav";

const NoPrefetchLink = (props: any) => <Link prefetch={false} {...props} />;

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const isHome  = useActive("/v2", true);
  const isNeeds = useActive("/v2/needs");
  const isGuide = useActive("/v2/guide");
  const isNews  = useActive("/v2/news");
  const isMe    = useActive("/me");
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b h-14">
      <div className="container-page h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="inline-block w-5 h-5 rounded bg-sky-600" aria-hidden />
            <span>NeedPort</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-5 text-sm">
          <Link href="/v2"        className={isHome  ? "text-sky-700 font-semibold" : "text-slate-700 hover:text-sky-700"}>ホーム</Link>
          <Link href="/v2/needs"  className={isNeeds ? "text-sky-700 font-semibold" : "text-slate-700 hover:text-sky-700"}>ニーズ一覧</Link>
          <Link href="/v2/guide"  className={isGuide ? "text-sky-700 font-semibold" : "text-slate-700 hover:text-sky-700"}>ガイド</Link>
          <Link href="/v2/news"   className={isNews  ? "text-sky-700 font-semibold" : "text-slate-700 hover:text-sky-700"}>お知らせ</Link>
          <Link href="/me"        className={isMe    ? "text-sky-700 font-semibold" : "text-slate-700 hover:text-sky-700"}>マイページ</Link>
        </nav>
        <button aria-label="メニュー" onClick={()=>setOpen(v=>!v)} className="md:hidden p-2 rounded hover:bg-slate-100">
          <span className="i">≡</span>
        </button>
        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="px-3 py-1.5 text-sm border rounded hover:bg-slate-50">ログイン</Link>
          <Link href="/v2/needs/new" className="px-3 py-1.5 text-sm rounded bg-sky-600 text-white hover:bg-sky-700">ニーズを投稿</Link>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <nav className="container-page py-2 grid gap-1 text-sm">
            <Link onClick={()=>setOpen(false)} href="/v2"       className="px-2 py-2 rounded hover:bg-slate-50">ホーム</Link>
            <Link onClick={()=>setOpen(false)} href="/v2/needs" className="px-2 py-2 rounded hover:bg-slate-50">ニーズ一覧</Link>
            <Link onClick={()=>setOpen(false)} href="/v2/guide" className="px-2 py-2 rounded hover:bg-sky-50">ガイド</Link>
            <Link onClick={()=>setOpen(false)} href="/v2/news"  className="px-2 py-2 rounded hover:bg-slate-50">お知らせ</Link>
            <Link onClick={()=>setOpen(false)} href="/me"       className="px-2 py-2 rounded hover:bg-slate-50">マイページ</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
