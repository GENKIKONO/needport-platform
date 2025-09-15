export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-lg font-semibold">ページが見つかりませんでした</div>
      <p className="text-slate-600 mt-2">URLが正しいかご確認ください。</p>
      <a href="/" className="inline-block mt-4 text-sky-700 underline">ホームに戻る</a>
    </div>
  );
}
