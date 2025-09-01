import "../../globals.css";
import Link from "next/link";

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col bg-white">
        <header className="border-b bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/v2" className="font-bold text-xl">NeedPort</Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/v2/needs">ニーズ</Link>
              <Link href="/v2/vendors">事業者</Link>
              <Link href="/v2/needs/new">投稿</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t bg-slate-50 text-slate-600 text-sm">
          <div className="max-w-6xl mx-auto px-4 py-3">
            &copy; {new Date().getFullYear()} NeedPort. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
