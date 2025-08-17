'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Home, List, SquarePen, UserRound, Anchor, Map, ShieldCheck, Scale, Building2, MessageSquare } from 'lucide-react';
import useMounted from './util/useMounted';

export default function MobileMenu({
  open, onClose,
}: { open:boolean; onClose:() => void }) {
  // ✅ すべての hooks は先頭で宣言
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mounted = useMounted();

  useEffect(() => {
    const onKey = (e:KeyboardEvent) => { 
      if(e.key === 'Escape') onClose(); 
    };
    
    if (open) {
      window.addEventListener('keydown', onKey);
      // スクロールロック
      document.body.style.overflow = 'hidden';
      // フォーカスを最初のリンクへ
      setTimeout(() => firstLinkRef.current?.focus(), 100);
    }
    
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // 初回は描画だけ行い、操作は不可に（hooks 数を一定に維持）
  if (!open) {
    return <div aria-hidden className="fixed inset-0 pointer-events-none opacity-0" />;
  }

  return (
    <div aria-modal="true" role="dialog" className="fixed inset-0 z-50">
      {/* backdrop */}
      <button 
        aria-label="close menu" 
        onClick={onClose}
        className="absolute inset-0 bg-black/40" 
      />
      
      {/* panel - 右からスライドイン */}
      <div 
        className="absolute right-0 top-0 h-full w-[86%] max-w-[360px] bg-white shadow-2xl rounded-l-2xl p-4 space-y-1 overflow-y-auto"
        aria-disabled={!mounted}
        style={!mounted ? {pointerEvents:'none', opacity:.001} : undefined}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-bold text-neutral-900">NeedPort</div>
          <button 
            ref={closeButtonRef}
            onClick={onClose}
            className="btn btn-ghost text-neutral-700 hover:bg-neutral-100"
            aria-label="メニューを閉じる"
          >
            ×
          </button>
        </div>

        <nav className="space-y-1">
          <Link 
            ref={firstLinkRef}
            className="np-card p-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors"
            href="/" 
            onClick={onClose}
          >
            <Home className="w-5 h-5 text-neutral-600" />
            <div>
              <div className="font-medium">ホーム</div>
              <div className="text-sm text-neutral-500">トップページ</div>
            </div>
          </Link>
          
          <Link 
            className="np-card p-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors"
            href="/needs" 
            onClick={onClose}
          >
            <List className="w-5 h-5 text-neutral-600" />
            <div>
              <div className="font-medium">みんなの「欲しい」</div>
              <div className="text-sm text-neutral-500">ユーザーのお願い</div>
            </div>
          </Link>
          
          <Link 
            className="np-card p-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors"
            href="/post" 
            onClick={onClose}
          >
            <SquarePen className="w-5 h-5 text-neutral-600" />
            <div>
              <div className="font-medium">投稿する</div>
              <div className="text-sm text-neutral-500">新しいニーズを投稿</div>
            </div>
          </Link>
          
          <Link 
            className="np-card p-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors"
            href="/me" 
            onClick={onClose}
          >
            <UserRound className="w-5 h-5 text-neutral-600" />
            <div>
              <div className="font-medium">マイページ</div>
              <div className="text-sm text-neutral-500">あなたの情報</div>
            </div>
          </Link>
          
          <Link 
            className="np-card p-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors"
            href="/services" 
            onClick={onClose}
          >
            <Building2 className="w-5 h-5 text-neutral-600" />
            <div>
              <div className="font-medium">企業の「できる」</div>
              <div className="text-sm text-neutral-500">企業のサービス</div>
            </div>
          </Link>
          
          <Link 
            className="np-card p-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors"
            href="/guide" 
            onClick={onClose}
          >
            <Anchor className="w-5 h-5 text-neutral-600" />
            <div>
              <div className="font-medium">サービス航海図</div>
              <div className="text-sm text-neutral-500">使い方ガイド</div>
            </div>
          </Link>

          <div className="my-4 h-px bg-neutral-200" />

          <details className="np-card p-0 overflow-hidden">
            <summary className="flex items-center gap-3 py-3 px-3 cursor-pointer select-none text-neutral-700 hover:bg-neutral-50 min-h-[48px]">
              <Map className="w-5 h-5 text-neutral-600"/><span className="text-[17px] font-medium">サイト情報</span>
            </summary>
            <div className="border-t border-neutral-100">
              <Link className="flex items-center gap-3 py-3 px-3 hover:bg-neutral-50 min-h-[48px]" href="/info/privacy" onClick={onClose}><ShieldCheck className="w-5 h-5 text-neutral-600"/><span className="text-[17px] font-medium">プライバシーポリシー</span></Link>
              <Link className="flex items-center gap-3 py-3 px-3 hover:bg-neutral-50 min-h-[48px]" href="/info/terms" onClick={onClose}><Scale className="w-5 h-5 text-neutral-600"/><span className="text-[17px] font-medium">利用規約</span></Link>
              <Link className="flex items-center gap-3 py-3 px-3 hover:bg-neutral-50 min-h-[48px]" href="/info/company" onClick={onClose}><Building2 className="w-5 h-5 text-neutral-600"/><span className="text-[17px] font-medium">運営会社</span></Link>
              <Link className="flex items-center gap-3 py-3 px-3 hover:bg-neutral-50 min-h-[48px]" href="/info/tokusho" onClick={onClose}><Scale className="w-5 h-5 text-neutral-600"/><span className="text-[17px] font-medium">特定商取引法</span></Link>
            </div>
          </details>
        </nav>
      </div>
    </div>
  );
}
