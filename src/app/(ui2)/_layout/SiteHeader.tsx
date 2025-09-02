"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/v2", label: "ホーム" },
  { href: "/v2/needs", label: "ニーズ一覧" },
  { href: "/v2/guide", label: "ガイド" },
  { href: "/v2/news", label: "お知らせ" },
  { href: "/v2/me", label: "マイページ" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <a href="#main" className="sr-only focus:not-sr-only focus-ring absolute left-2 top-2 z-50 bg-white px-2 py-1 rounded">
        本文へスキップ
      </a>
      <header className="container-page h-14 flex items-center justify-between">
        <Link href="/v2" className="font-extrabold tracking-tight text-slate-800">
          NeedPort
        </Link>
        <nav className="hidden md:flex items-center gap-5">
          {nav.map(i => (
            <Link
              key={i.href}
              href={i.href}
              className={[
                "text-sm hover:text-sky-700",
                pathname?.startsWith(i.href) ? "text-sky-600 font-semibold" : "text-slate-600"
              ].join(" ")}
            >
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="text-sm text-slate-600 hover:text-sky-700">ログイン</Link>
        </div>
      </header>
    </div>
  );
}
