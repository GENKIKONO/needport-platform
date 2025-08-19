'use client';

import Link from 'next/link';

const items = [
  { 
    href: '/needs', 
    label: 'みんなの「欲しい」', 
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )
  },
  { 
    href: '/vendor/services', 
    label: '企業の「できる」', 
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  { 
    href: '/docs/航海図', 
    label: 'サービス航海図', 
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    )
  },
  { 
    href: '/about', 
    label: 'サイト情報', 
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
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
              <div className="mb-2 text-2xl text-gray-600 group-hover:text-blue-600">
                {it.icon}
              </div>
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
