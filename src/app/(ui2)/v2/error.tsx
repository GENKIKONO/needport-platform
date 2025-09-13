"use client";
import ErrorBox from "../_parts/ErrorBox";
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="ja">
      <body className="max-w-3xl mx-auto p-6">
        <ErrorBox title="ページの表示に失敗しました" detail={error?.message || "時間をおいて再度お試しください。"} />
        <div className="mt-3 text-xs text-slate-500">code: {error?.digest || "unknown"}</div>
        <a href="/" className="inline-block mt-4 text-sky-700 underline">ホームに戻る</a>
      </body>
    </html>
  );
}
