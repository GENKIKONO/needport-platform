// src/app/needs/[id]/propose/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ニーズ提案 | NeedPort",
  description: "事業者がニーズに対して提案を送信するページ。",
};

export default function NeedProposePage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">提案フォーム</h1>
      <p className="text-sm text-slate-600">ニーズID: {params.id}</p>

      <form className="space-y-3 border rounded p-4 bg-white">
        <input
          type="text"
          name="company"
          placeholder="事業者名"
          className="w-full border rounded px-3 py-2 text-sm"
        />
        <textarea
          name="proposal"
          placeholder="提案内容"
          rows={6}
          className="w-full border rounded px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700"
        >
          提案を送信
        </button>
      </form>

      <Link href={`/needs/${params.id}`} className="text-sky-700 underline text-sm">
        ← ニーズ詳細に戻る
      </Link>
    </div>
  );
}
