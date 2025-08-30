'use client';
import Link from 'next/link';
export default function SupportBox(){
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">サポート</h2>
      <div className="rounded-md border bg-white p-4 space-y-2">
        <p className="text-sm text-slate-700">お困りの際は以下のページをご確認ください。</p>
        <ul className="list-disc list-inside text-sm">
          <li><Link className="text-blue-700 underline" href="/faq">FAQ</Link></li>
          <li><Link className="text-blue-700 underline" href="/terms">利用規約</Link></li>
          <li><Link className="text-blue-700 underline" href="/legal/tokusho">特定商取引法に基づく表記</Link></li>
        </ul>
      </div>
    </section>
  );
}
