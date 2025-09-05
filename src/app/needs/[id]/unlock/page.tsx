// src/app/needs/[id]/unlock/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "閲覧解放 | NeedPort",
  description: "事業者向けに、詳細情報を開示するためのページ（将来Stripe連携予定）。",
};

export default function NeedUnlockPage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">閲覧解放</h1>
      <p className="text-slate-600 text-sm">
        ニーズ <span className="font-mono">{params.id}</span> の詳細情報を開示します。
      </p>

      <div className="rounded border bg-white p-4 space-y-3">
        <p className="text-sm text-slate-700">
          この操作により、連絡先などの詳細情報が確認できるようになります。
          将来的には安全のため Stripe 決済を通じて開放される予定です。
        </p>
        <button
          className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700"
        >
          閲覧解放する（ダミー）
        </button>
      </div>

      <Link href={`/needs/${params.id}`} className="text-sky-700 underline text-sm">
        ← ニーズ詳細に戻る
      </Link>
    </div>
  );
}
