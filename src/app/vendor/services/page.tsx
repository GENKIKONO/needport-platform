'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ServicesListPage() {
  const [ready, setReady] = useState(false);
  const [hasVendor, setHasVendor] = useState(false);

  useEffect(() => {
    fetch('/api/me/vendor', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setHasVendor(!!(d && d.profile)))
      .finally(() => setReady(true));
  }, []);

  const to = hasVendor
    ? '/vendor/services/new'
    : `/vendor/register?returnTo=${encodeURIComponent('/vendor/services/new')}`;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">サービス・商品一覧</h1>
        {ready && (
          <Link
            href={to}
            className="rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
          >
            + サービス・商品を登録
          </Link>
        )}
      </div>

      {/* 以降は既存の一覧UI */}
      <div className="mt-6">
        <p className="text-sm text-gray-600">
          登録されたサービス・商品がここに表示されます。
        </p>
      </div>
    </div>
  );
}
