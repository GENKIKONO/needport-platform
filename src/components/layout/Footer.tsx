import { readCms } from "@/lib/cms/storage";

export function Footer() {
  return (
    <footer className="mt-20 border-t bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-600 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="NeedPort" className="h-5 w-auto" />
          <span>© NeedPort</span>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          <a href="/about" className="hover:underline">会社情報</a>
          <a href="/terms" className="hover:underline">利用規約</a>
          <a href="/commerce" className="hover:underline">特定商取引法に基づく表記</a>
          <a href="/privacy" className="hover:underline">プライバシー</a>
          <a href="/contact" className="hover:underline">お問い合わせ</a>
        </nav>
      </div>
    </footer>
  );
}
