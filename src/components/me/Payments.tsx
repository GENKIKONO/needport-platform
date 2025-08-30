'use client';
import Link from 'next/link';
export default function Payments(){
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">支払い状況</h2>
      <div className="rounded-md border bg-white p-4">
        <p className="text-sm text-slate-700">カード決済は準備中です。銀行振込（推奨）：手数料が最小で済みます。</p>
        <div className="mt-3 flex gap-3">
          <Link href="/api/me/invoices" className="px-3 py-2 rounded bg-slate-900 text-white">領収書一覧</Link>
          <Link href="/sample-invoice.pdf" className="px-3 py-2 rounded border">サンプルPDF</Link>
        </div>
      </div>
    </section>
  );
}
