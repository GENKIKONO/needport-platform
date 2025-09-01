import "../../globals.css";
import Link from "next/link";
import MobileNav from "../_parts/MobileNav";
import ToastProvider from "../_parts/ToastProvider";

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col bg-white">
        <header className="border-b bg-slate-900 text-white" role="banner">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <Link href="/v2" className="font-bold text-xl">NeedPort</Link>
            <nav className="hidden md:flex gap-4 text-sm" aria-label="グローバル">
              <Link href="/v2/needs" className="hover:underline">ニーズ</Link>
              <Link href="/v2/vendors" className="hover:underline">事業者</Link>
              <Link href="/v2/needs/new" className="hover:underline">投稿</Link>
            </nav>
            <MobileNav />
          </div>
        </header>
        <ToastProvider>
          <main className="flex-1" role="main">{children}</main>
        </ToastProvider>
        <footer className="border-t bg-slate-50 text-slate-600 text-sm">
          <div className="max-w-6xl mx-auto px-4 py-3">
            &copy; {new Date().getFullYear()} NeedPort. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
