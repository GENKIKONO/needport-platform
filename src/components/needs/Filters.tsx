'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Filters() {
  const sp = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [region, setRegion] = useState(sp.get('region') ?? '');
  const [cat, setCat] = useState(sp.get('cat') ?? '');
  const [sort, setSort] = useState(sp.get('sort') ?? 'new');

  useEffect(() => { setQ(sp.get('q') ?? ''); setRegion(sp.get('region') ?? ''); setCat(sp.get('cat') ?? ''); setSort(sp.get('sort') ?? 'new'); }, [sp]);

  const apply = () => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (region) p.set('region', region);
    if (cat) p.set('cat', cat);
    if (sort) p.set('sort', sort);
    router.push(`/needs?${p.toString()}`);
  };

  return (
    <div className="grid gap-2 md:grid-cols-12">
      <input className="md:col-span-5 border rounded px-3 py-2" placeholder="キーワード" value={q} onChange={e=>setQ(e.target.value)} />
      <input className="md:col-span-2 border rounded px-3 py-2" placeholder="地域(例: 高知)" value={region} onChange={e=>setRegion(e.target.value)} />
      <input className="md:col-span-2 border rounded px-3 py-2" placeholder="カテゴリ" value={cat} onChange={e=>setCat(e.target.value)} />
      <select className="md:col-span-2 border rounded px-3 py-2" value={sort} onChange={e=>setSort(e.target.value)}>
        <option value="new">新着</option>
        <option value="popular">人気</option>
        <option value="deadline">期限</option>
      </select>
      <button onClick={apply} className="md:col-span-1 rounded bg-blue-600 text-white px-3 py-2">適用</button>
    </div>
  );
}
