export const dynamic="force-dynamic"; 
export const revalidate=0;
import Link from "next/link";
import { getNeedByIdSafe } from "@/lib/demo/data";
export default async function NeedDetail({params}:{params:{id:string}}){
  const need = await getNeedByIdSafe(params.id);
  if(!need){ // 赤エラー回避：静かな404
    return (
      <main className="container py-10">
        <div className="card">
          <h1 className="text-xl font-bold">ニーズが見つかりませんでした</h1>
          <p className="mt-2 text-sm text-gray-600">URLを確認するか、一覧から探してみてください。</p>
          <div className="mt-4 flex gap-2">
            <Link className="btn btn-primary" href="/needs">一覧へ</Link>
            <Link className="btn" href="/">ホームへ</Link>
          </div>
        </div>
      </main>
    );
  }
  return (
    <main className="container py-8 space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold">{need.title}</h1>
        <p className="mt-3 text-gray-700 leading-7">{need.description}</p>
        <div className="mt-4 flex gap-2">
          <Link href="/post" className="btn btn-primary">賛同して参加する</Link>
          <Link href="/needs" className="btn">一覧へ</Link>
        </div>
      </div>
    </main>
  );
}
