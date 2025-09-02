import Link from "next/link";
export default function NotFound(){
  return <div className="container-page py-20 text-center space-y-4">
    <h1 className="text-2xl font-bold">ページが見つかりません</h1>
    <p className="text-slate-600">お探しのページは移動された可能性があります。</p>
    <div className="flex gap-3 justify-center">
      <Link href="/v2" className="text-sky-700 underline">ホームへ</Link>
      <Link href="/v2/needs" className="text-sky-700 underline">ニーズ一覧へ</Link>
    </div>
  </div>;
}
