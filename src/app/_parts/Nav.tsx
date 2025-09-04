"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "ホーム" },
  { href: "/needs", label: "ニーズ一覧" },
  { href: "/vendors", label: "事業者一覧" },
  { href: "/news", label: "お知らせ" },
  { href: "/me", label: "マイページ" },
  { href: "/roadmap", label: "サービス航海図" }, // 常設
];

export default function Nav(){
  const path = usePathname();
  return (
    <nav className="flex gap-4 text-sm">
      {items.map(i=>(
        <Link key={i.href} href={i.href} className={path===i.href? "font-semibold text-sky-700":"text-slate-700 hover:text-sky-700"}>
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
