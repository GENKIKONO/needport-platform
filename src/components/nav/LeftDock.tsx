// src/components/nav/LeftDock.tsx
"use client";

import Link from "next/link";

const sections: Array<{ title: string; items: Array<{ href: string; label: string }> }> = [
  {
    title: "みんなの『欲しい』",
    items: [
      { href: "/needs", label: "ニーズ一覧" },
      { href: "/needs/new", label: "ニーズを投稿" },
    ],
  },
  {
    title: "企業の『できる』",
    items: [
      { href: "/vendors/register", label: "事業者登録" },
      { href: "/me/vendor/guide", label: "提案ガイド" }, // ガイドは事業者側に統合
      { href: "/sea", label: "海中（ニーズ保管庫）" },   // 追加
    ],
  },
  {
    title: "ガイド",
    items: [
      { href: "/roadmap", label: "サービス航海図" },
      { href: "/faq", label: "よくある質問" },
    ],
  },
  {
    title: "サイト情報",
    items: [
      { href: "/news", label: "お知らせ" },
      { href: "/info", label: "このサイトについて" },
    ],
  },
];

function NavList() {
  return (
    <nav className="p-3">
      {sections.map((s) => (
        <div key={s.title} className="mb-6">
          <div className="px-2 text-xs font-semibold text-slate-500 mb-2">{s.title}</div>
          <ul className="space-y-1">
            {s.items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className="block rounded px-2 py-1.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export default function LeftDock() {
  return (
    <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 bg-white">
      <NavList />
    </aside>
  );
}

// モバイルドロワー（AppShellから呼ぶ）
export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div className={`lg:hidden fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-slate-900/30 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`absolute left-0 top-0 h-full w-[78%] max-w-[320px] bg-white border-r border-slate-200 transform transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-14 flex items-center px-3 border-b">
          <span className="font-semibold">メニュー</span>
          <button className="ml-auto p-2 rounded hover:bg-slate-100" onClick={onClose} aria-label="閉じる">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-56px)]">
          <NavList />
        </div>
      </div>
    </div>
  );
}
