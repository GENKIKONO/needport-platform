"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const items = [
  { href: "/", label: "ホーム", icon:"🏠" },
  { href: "/needs", label: "ニーズ", icon:"🔎" },
  { href: "/post", label: "投稿", icon:"➕" },
  { href: "/me", label: "マイページ", icon:"👤" },
];
export default function BottomNav(){
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-black/10 bg-white/95 dark:bg-neutral-900/90 backdrop-blur md:hidden">
      <div className="grid grid-cols-4">
        {items.map(it=>(
          <Link key={it.href} href={it.href} className={`flex flex-col items-center py-2 ${path===it.href?"text-blue-600":""}`}>
            <span aria-hidden>{it.icon}</span><span className="text-[11px]">{it.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
