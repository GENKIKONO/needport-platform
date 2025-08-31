'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

async function fetchUnread() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_PLATFORM_ORIGIN || ''}/api/notifications/list?limit=20`, { cache:'no-store', headers:{ 'x-needport-internal':'1' } });
    if (!res.ok) return 0;
    const js = await res.json();
    return (js.rows || []).filter((r:any)=>!r.read).length;
  } catch { return 0; }
}

export default function Header(){
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetchUnread().then(setUnread);
  }, []);
  // 背景のスクロール固定（モバイルメニュー開時）
  useEffect(()=>{
    if (open) { document.body.style.overflow='hidden'; }
    else { document.body.style.overflow=''; }
    return ()=>{ document.body.style.overflow=''; };
  },[open]);
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl flex items-center justify-between h-14 px-4">
        {/* 左上ロゴ：常にホームへ */}
        <Link href="/" aria-label="NeedPort ホームへ">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="NeedPort" className="h-6 w-auto" />
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          <a href="/vendor/connect" className="text-sm hover:underline">事業者口座登録</a>
          <a href="/needs" className="text-sm hover:underline">ニーズ一覧</a>
          <a href="/needs/new" className="text-sm hover:underline">介護タクシー依頼</a>
          <a href="/vendors" className="text-sm hover:underline">事業者リスト</a>
          <a href="/v2" className="text-sm hover:underline text-slate-500">UI v2</a>
          <a href="/guide" className="text-sm hover:underline">ガイド</a>
          <Link href="/me" className="relative inline-flex items-center justify-center rounded px-2 py-1 text-sm">
            <span>通知</span>
            {unread > 0 && (
              <span className="absolute -right-2 -top-1 rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">{unread}</span>
            )}
          </Link>
          <a href="/admin/settlements" className="text-xs text-muted-foreground hover:underline">運用</a>
          <a href="/admin/needs" className="text-xs text-gray-500 hover:text-gray-700">承認キュー</a>
          <a href="/admin/messages" className="text-xs text-gray-500 hover:text-gray-700">メッセージ承認</a>
          <a href="/admin/ng-words" className="text-xs text-gray-500 hover:text-gray-700">NGワード管理</a>
          <a href="/admin/industries" className="text-xs text-gray-500 hover:text-gray-700">業種管理</a>
        </nav>
        <button
          className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded hover:bg-gray-100"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={()=>setOpen(v=>!v)}
        >
          <span className="sr-only">メニュー</span>
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor"/></svg>
        </button>
      </div>
      {/* モバイルメニュー（開閉時に背景固定） */}
      <div
        id="mobile-menu"
        className={`md:hidden fixed inset-x-0 top-14 bg-white border-t transition-[max-height,opacity] duration-200 overflow-hidden ${open ? 'max-h-[50vh] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <nav className="px-4 py-3 flex flex-col">
          <a href="/vendor/connect" onClick={()=>setOpen(false)} className="py-2">事業者口座登録</a>
          <Link href="/needs" onClick={()=>setOpen(false)} className="py-2">ニーズ一覧</Link>
          <Link href="/needs/new" onClick={()=>setOpen(false)} className="py-2">介護タクシー依頼</Link>
          <Link href="/vendors" onClick={()=>setOpen(false)} className="py-2">事業者リスト</Link>
          <Link href="/v2" onClick={()=>setOpen(false)} className="py-2 text-slate-500">UI v2</Link>
          <Link href="/guide" onClick={()=>setOpen(false)} className="py-2">ガイド</Link>
          <Link href="/me" onClick={()=>setOpen(false)} className="py-2 relative">
            通知
            {unread > 0 && (
              <span className="absolute -right-2 -top-1 rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">{unread}</span>
            )}
          </Link>
          <a href="/admin/settlements" onClick={()=>setOpen(false)} className="py-2 text-xs text-muted-foreground">運用</a>
          <a href="/admin/needs" onClick={()=>setOpen(false)} className="py-2 text-xs text-gray-500">承認キュー</a>
          <a href="/admin/messages" onClick={()=>setOpen(false)} className="py-2 text-xs text-gray-500">メッセージ承認</a>
          <a href="/admin/ng-words" onClick={()=>setOpen(false)} className="py-2 text-xs text-gray-500">NGワード管理</a>
          <a href="/admin/industries" onClick={()=>setOpen(false)} className="py-2 text-xs text-gray-500">業種管理</a>
        </nav>
      </div>
    </header>
  );
}
