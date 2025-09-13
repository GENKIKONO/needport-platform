'use client';
import Link from "next/link";
export default function GlobalError({ error }: { error: Error }){
  return (
    <div className="container-page py-16 text-center space-y-4">
      <h1 className="text-3xl font-extrabold">エラーが発生しました</h1>
      <p className="text-slate-600">{error?.message ?? "不明なエラー"}</p>
      <div className="flex gap-2 justify-center">
        <Link className="px-4 py-2 rounded bg-sky-600 text-white" href="/">ホームへ</Link>
        <Link className="px-4 py-2 rounded border" href="/needs">ニーズ一覧へ</Link>
      </div>
    </div>
  );
}
