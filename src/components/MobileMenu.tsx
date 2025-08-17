'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Home, List, SquarePen, UserRound, Anchor, Map, ShieldCheck, Scale, Building2, MessageSquare } from 'lucide-react';

export default function MobileMenu({
  open, onClose,
}: { open:boolean; onClose:() => void }) {
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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

  if (!open) return null;

  return (
    <div aria-modal="true" role="dialog" className="fixed inset-0 z-50">
      {/* backdrop */}
      <button 
        aria-label="close menu" 
        onClick={onClose}
        className="absolute inset-0 bg-black/40" 
      />
      
      {/* panel - 右からスライドイン */}
      <div className="absolute right-0 top-0 h-full w-[86%] max-w-[360px] bg-white shadow-2xl rounded-l-2xl p-4 space-y-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-semibold text-neutral-900">NeedPort</div>
          <button 
            ref={closeButtonRef}
            onClick={onClose}
            className="btn btn-ghost h-9 w-9 rounded-full p-0"
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

          <div className="np-card p-3 flex items-center gap-3 text-neutral-500">
            <MessageSquare className="w-5 h-5 text-neutral-500" />
            <div>
              <div className="font-medium">案件ルーム</div>
              <div className="text-sm text-neutral-400">近日対応</div>
            </div>
          </div>

          <Link 
            className="np-card p-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors"
            href="/info" 
            onClick={onClose}
          >
            <Map className="w-5 h-5 text-neutral-600" />
            <div className="font-medium">サイト情報</div>
          </Link>
          
          <Link 
            className="np-card p-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors"
            href="/info/privacy" 
            onClick={onClose}
          >
            <ShieldCheck className="w-5 h-5 text-neutral-600" />
            <div className="font-medium">プライバシーポリシー</div>
          </Link>
          
          <Link 
            className="np-card p-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors"
            href="/info/terms" 
            onClick={onClose}
          >
            <Scale className="w-5 h-5 text-neutral-600" />
            <div className="font-medium">利用規約</div>
          </Link>
          
          <Link 
            className="np-card p-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors"
            href="/info/company" 
            onClick={onClose}
          >
            <Building2 className="w-5 h-5 text-neutral-600" />
            <div className="font-medium">運営会社</div>
          </Link>
          
          <Link 
            className="np-card p-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors"
            href="/info/tokusho" 
            onClick={onClose}
          >
            <Scale className="w-5 h-5 text-neutral-600" />
            <div className="font-medium">特定商取引法</div>
          </Link>
        </nav>
      </div>
    </div>
  );
}
