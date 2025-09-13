import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理ダッシュボード | NeedPort",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false }
  }
};

export default async function AdminDashboard(){
  const { userId } = auth();
  if(!userId){
    redirect("/sign-in");
  }
  
  return <div className="mx-auto max-w-6xl p-6 space-y-6">
    <h1 className="text-2xl font-bold">管理ダッシュボード</h1>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="border rounded p-4">
        <h3 className="font-semibold">ニーズ管理</h3>
        <p className="text-sm text-slate-600">投稿されたニーズの管理</p>
      </div>
      <div className="border rounded p-4">
        <h3 className="font-semibold">事業者管理</h3>
        <p className="text-sm text-slate-600">登録事業者の管理</p>
      </div>
      <div className="border rounded p-4">
        <h3 className="font-semibold">ユーザー管理</h3>
        <p className="text-sm text-slate-600">ユーザーアカウントの管理</p>
      </div>
      <div className="border rounded p-4 cursor-pointer hover:bg-slate-50" onClick={() => window.location.href = '/admin/payments'}>
        <h3 className="font-semibold">決済管理 (Lv1)</h3>
        <p className="text-sm text-slate-600">held取引の手動解放・返金処理</p>
        <div className="mt-2 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
          ⚠️ 運営主導 - 自動処理なし
        </div>
      </div>
    </div>
  </div>;
}