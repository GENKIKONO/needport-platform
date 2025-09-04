import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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
    </div>
  </div>;
}