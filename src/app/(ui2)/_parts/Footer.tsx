import Link from "next/link";
export default function FooterV2(){
  return (
    <footer className="mt-10 border-t">
      <div className="max-w-6xl mx-auto px-3 py-8 text-sm text-slate-600 grid sm:grid-cols-3 gap-4">
        <div>
          <div className="font-medium text-slate-800 mb-2">NeedPort</div>
          <div>ニッチなニーズを集め、賛同者と事業者で形に。</div>
        </div>
        <div className="grid gap-2">
          <Link href="/needs">既存UI（参考）</Link>
          <Link href="/contact">お問い合わせ</Link>
        </div>
        <div className="grid gap-2">
          <Link href="/legal/terms">利用規約</Link>
          <Link href="/legal/privacy">プライバシー</Link>
          <Link href="/legal/tokushoho">特商法</Link>
        </div>
      </div>
    </footer>
  );
}
