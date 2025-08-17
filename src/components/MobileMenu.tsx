'use client';
import Link from 'next/link';
import { useEffect } from 'react';

export default function MobileMenu({
  open, onClose,
}: { open:boolean; onClose:() => void }) {
  useEffect(() => {
    const onKey = (e:KeyboardEvent)=>{ if(e.key==='Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div aria-modal="true" role="dialog" className="fixed inset-0 z-50">
      {/* backdrop */}
      <button aria-label="close menu" onClick={onClose}
        className="absolute inset-0 bg-black/40" />
      {/* panel */}
      <div className="absolute left-0 top-0 h-full w-[86%] max-w-sm bg-white shadow-xl p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-semibold text-brand-700">NeedPort</div>
          <button onClick={onClose}
            className="rounded-xl bg-blue-50 text-blue-600 px-3 py-1.5">×</button>
        </div>

        <nav className="space-y-2">
          <Link className="block rounded-xl border border-black/5 p-4 hover:bg-blue-50"
                href="/needs" onClick={onClose}>
            <div className="font-medium">みんなの「欲しい」</div>
            <div className="text-sm text-neutral-500">ユーザーのお願い</div>
          </Link>
          <Link className="block rounded-xl border border-black/5 p-4 hover:bg-blue-50"
                href="/services" onClick={onClose}>
            <div className="font-medium">企業の「できる」</div>
            <div className="text-sm text-neutral-500">企業のサービス</div>
          </Link>
          <Link className="block rounded-xl border border-black/5 p-4 hover:bg-blue-50"
                href="/guide" onClick={onClose}>
            <div className="font-medium">サービス航海図</div>
            <div className="text-sm text-neutral-500">使い方ガイド</div>
          </Link>

          <div className="my-4 h-px bg-neutral-200" />

          <Link className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50"
                href="/info" onClick={onClose}>サイト情報</Link>
          <Link className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50"
                href="/info/privacy" onClick={onClose}>プライバシーポリシー</Link>
          <Link className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50"
                href="/info/terms" onClick={onClose}>利用規約</Link>
          <Link className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50"
                href="/info/company" onClick={onClose}>運営会社</Link>
          <Link className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50"
                href="/info/tokusho" onClick={onClose}>特定商取引法</Link>
        </nav>
      </div>
    </div>
  );
}
