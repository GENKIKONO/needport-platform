import { readCms } from "@/lib/cms/storage";

import Link from 'next/link';
export default function Footer(){
  return (
    <footer className="border-t mt-10">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-600 grid gap-2 sm:flex sm:items-center sm:justify-between">
        <div>© NeedPort</div>
        <nav className="flex flex-wrap gap-4">
          <Link href="/contact">お問い合わせ</Link>
          <Link href="/(public)/legal/terms">利用規約</Link>
          <Link href="/(public)/legal/privacy">プライバシー</Link>
          <Link href="/(public)/legal/tokushoho">特商法表記</Link>
        </nav>
      </div>
    </footer>
  );
}
