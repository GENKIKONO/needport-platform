'use client';

import Link from 'next/link';

const items = [
  { href: '/needs', label: 'みんなの「欲しい」', icon: '❤️' },
  { href: '/vendor/services', label: '企業の「できる」', icon: '🚢' },
  { href: '/docs/航海図', label: 'サービス航海図', icon: '🗺️' },
  { href: '/about', label: 'サイト情報', icon: 'ℹ️' },
];

export default function QuickLinks() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-8">
      <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              className="group block rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-2 text-2xl">{it.icon}</div>
              <div className="font-medium group-hover:text-blue-600">
                {it.label}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
