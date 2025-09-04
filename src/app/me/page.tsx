import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MePage(){
  const { userId } = auth();
  if(!userId){
    redirect("/sign-in");
  }
  
  return <div className="mx-auto max-w-4xl p-6 space-y-6">
    <h1 className="text-2xl font-bold">マイページ</h1>
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="border rounded p-4">
        <h3 className="font-semibold mb-2">投稿したニーズ</h3>
        <p className="text-sm text-slate-600 mb-3">あなたが投稿したニーズを管理できます</p>
        <Link href="/needs/new" className="text-sm px-3 py-1 rounded bg-sky-600 text-white">新規投稿</Link>
      </div>
      <div className="border rounded p-4">
        <h3 className="font-semibold mb-2">提案した案件</h3>
        <p className="text-sm text-slate-600 mb-3">あなたが提案した案件の状況を確認できます</p>
        <Link href="/me/proposals" className="text-sm px-3 py-1 rounded border">提案履歴</Link>
      </div>
      <div className="border rounded p-4">
        <h3 className="font-semibold mb-2">事業者向け</h3>
        <p className="text-sm text-slate-600 mb-3">事業者としての機能とガイド</p>
        <Link href="/me/vendor/guide" className="text-sm px-3 py-1 rounded border">提案ガイド</Link>
      </div>
      <div className="border rounded p-4">
        <h3 className="font-semibold mb-2">アカウント設定</h3>
        <p className="text-sm text-slate-600 mb-3">プロフィールや通知設定を変更</p>
        <Link href="/me/settings" className="text-sm px-3 py-1 rounded border">設定</Link>
      </div>
    </div>
  </div>;
}