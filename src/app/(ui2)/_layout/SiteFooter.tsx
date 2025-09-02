import Link from "next/link";
export default function SiteFooter() {
  return (
    <footer className="border-t mt-10">
      <div className="container-page py-10 grid sm:grid-cols-2 gap-6 text-sm text-slate-600">
        <div>
          <div className="font-semibold mb-2">NeedPort</div>
          <p className="max-w-md">埋もれた声を、つなぐ。形にする。匿名で安心、賛同で実現、透明な取引。</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Link href="/v2/company" className="hover:text-sky-700">会社情報</Link><br/>
            <Link href="/v2/tos" className="hover:text-sky-700">利用規約</Link><br/>
            <Link href="/v2/law" className="hover:text-sky-700">特商法</Link>
          </div>
          <div className="space-y-2">
            <Link href="/v2/privacy" className="hover:text-sky-700">プライバシー</Link><br/>
            <Link href="/v2/contact" className="hover:text-sky-700">お問い合わせ</Link><br/>
            <Link href="/v2/news" className="hover:text-sky-700">お知らせ</Link>
          </div>
        </div>
      </div>
      <div className="py-4 text-center text-xs text-slate-400">© NeedPort</div>
    </footer>
  );
}
