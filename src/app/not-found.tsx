import Link from "next/link";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export default function NotFound(){
  return (
    <div className="container-page py-16 text-center space-y-4">
      <h1 className="text-3xl font-extrabold">ページが見つかりません</h1>
      <p className="text-slate-600">URLが間違っているか、削除された可能性があります。</p>
      <div className="flex gap-2 justify-center">
        <Link className="px-4 py-2 rounded bg-sky-600 text-white" href="/">ホームへ</Link>
        <Link className="px-4 py-2 rounded border" href="/needs">ニーズ一覧へ</Link>
      </div>
    </div>
  );
}
