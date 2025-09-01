"use client";
import "../../globals.css";
import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import MobileNav from "../_parts/MobileNav";
import { cn, isActivePath } from "../_parts/ui2.utils";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-dvh bg-white text-slate-900">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

function Header(){
  const pathname = usePathname();
  return (
    <header className="border-b bg-slate-900 text-white" role="banner">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/v2" className="font-bold text-xl">NeedPort</Link>
        <nav className="hidden md:flex gap-4 text-sm" aria-label="グローバル">
          <Link href="/v2/needs" className={cn("hover:underline", isActivePath(pathname||'',"/v2/needs") && "underline font-semibold")}>ニーズ</Link>
          <Link href="/v2/vendors" className={cn("hover:underline", isActivePath(pathname||'',"/v2/vendors") && "underline font-semibold")}>事業者</Link>
          <Link href="/v2/needs/new" className={cn("hover:underline", isActivePath(pathname||'',"/v2/needs/new") && "underline font-semibold")}>投稿</Link>
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}

function Footer(){
  return (
    <footer className="border-t bg-slate-50 text-slate-600 text-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center gap-3">
        <span>&copy; {new Date().getFullYear()} NeedPort</span>
        <a className="hover:underline" href="/legal/terms">利用規約</a>
        <a className="hover:underline" href="/legal/privacy">プライバシー</a>
        <a className="hover:underline" href="/legal/tokushoho">特商法</a>
        <a className="hover:underline" href="/contact">お問い合わせ</a>
      </div>
      {/* Optional: 軽量解析（envで有効化） */}
      {/* @ts-expect-error Server Component script */}
      {require("../_parts/Analytics").default()}
    </footer>
  );
}
