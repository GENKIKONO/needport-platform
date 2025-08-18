'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type Props = { children: React.ReactNode; returnTo?: string };

export default function EnsureVendorProfile({ children, returnTo }: Props) {
  const [loading, setLoading] = useState(true);
  const [hasVendor, setHasVendor] = useState<boolean | null>(null);
  const sp = useSearchParams();

  useEffect(() => {
    let alive = true;
    fetch('/api/me/vendor', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && setHasVendor(!!(d && d.profile)))
      .catch(() => alive && setHasVendor(false))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <p className="text-sm text-gray-500">読み込み中…</p>;

  if (!hasVendor) {
    const next =
      returnTo ||
      sp.get('returnTo') ||
      (typeof window !== 'undefined' ? window.location.pathname : '/');
    const href = `/vendor/register?returnTo=${encodeURIComponent(next)}`;
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 p-4">
        <h3 className="font-semibold mb-1">まず企業情報を登録してください</h3>
        <p className="text-sm text-gray-600 mb-3">
          サービス・商品を登録するには、企業・事業者の基本情報が必要です。
        </p>
        <Link
          href={href}
          className="inline-flex items-center gap-2 rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
        >
          企業情報を登録する
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
