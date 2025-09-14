import Link from "next/link";

export const dynamic = 'force-dynamic';

const items = [
  { href: "/v2/needs", label: "ニーズ一覧" },
  { href: "/v2/proposals", label: "提案一覧" },
  { href: "/v2/billing", label: "支払い管理" },
  { href: "/v2/me/profile", label: "プロフィール" },
];

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-6 md:grid-cols-[240px_1fr]">
      <aside className="hidden md:block">
        <nav className="card p-3 sticky top-20">
          <ul className="space-y-1 text-sm">
            {items.map(i=>(
              <li key={i.href}><Link className="block px-2 py-1 rounded hover:bg-sky-50" href={i.href}>{i.label}</Link></li>
            ))}
          </ul>
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
