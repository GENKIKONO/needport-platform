"use client";

export default function Error({ error, reset }:{ error: Error & { digest?: string }, reset: ()=>void }) {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
        ページの表示に失敗しました。時間をおいて再度お試しください。
      </div>
      <div className="mt-3 flex gap-3">
        <button onClick={reset} className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm">再読み込み</button>
        <a href="/needs" className="text-sky-700 underline text-sm">一覧に戻る</a>
      </div>
      <div className="mt-2 text-xs text-slate-500">code: {error?.digest || "unknown"}</div>
    </div>
  );
}
