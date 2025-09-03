import Link from "next/link";
export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-page py-10 text-sm text-slate-600 grid gap-6 md:grid-cols-2">
        <div>
          <div className="font-semibold mb-2">NeedPort</div>
          <p className="max-w-md">埋もれた声を、つなぐ。顔が見えない安心感 × ニーズの束ね × 透明な取引。</p>
        </div>
        <nav className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Link href="/company"         className="hover:text-sky-700">会社情報</Link>
          <Link href="/terms"           className="hover:text-sky-700">利用規約</Link>
          <Link href="/tokusho"         className="hover:text-sky-700">特商法</Link>
          <Link href="/privacy"         className="hover:text-sky-700">プライバシーポリシー</Link>
          <Link href="/contact"         className="hover:text-sky-700">お問い合わせ</Link>
          <Link href="/sitemap.xml"     className="hover:text-sky-700">サイトマップ</Link>
        </nav>
      </div>
    </footer>
  );
}
