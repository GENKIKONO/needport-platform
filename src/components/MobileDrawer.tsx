"use client";
import Link from "next/link";

export default function MobileDrawer({ open, onClose }:{open:boolean; onClose:()=>void}) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} aria-hidden />
      <aside className={`absolute left-0 top-0 h-full w-[88%] max-w-sm bg-white shadow-xl transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b flex items-center justify-between">
          <div className="text-lg font-semibold">NeedPort</div>
          <button onClick={onClose} aria-label="close" className="rounded-full bg-sky-100 px-3 py-1">×</button>
        </div>
        <nav className="p-4 space-y-2">
          <Link href="/needs" className="block rounded-xl p-3 hover:bg-sky-50">みんなの「欲しい」</Link>
          <Link href="/services" className="block rounded-xl p-3 hover:bg-sky-50">企業の「できる」</Link>
          <Link href="/guide" className="block rounded-xl p-3 hover:bg-sky-50">サービス航海図</Link>
          <div className="mt-4 border-t pt-4 text-sm text-neutral-500">サイト情報</div>
          <Link href="/privacy" className="block rounded-xl p-3 hover:bg-sky-50">プライバシーポリシー</Link>
          <Link href="/terms" className="block rounded-xl p-3 hover:bg-sky-50">利用規約</Link>
          <Link href="/company" className="block rounded-xl p-3 hover:bg-sky-50">運営会社</Link>
          <Link href="/law" className="block rounded-xl p-3 hover:bg-sky-50">特定商取引法</Link>
        </nav>
      </aside>
    </div>
  );
}
