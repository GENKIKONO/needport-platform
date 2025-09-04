import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ArchivedNeedsPage(){
  const { userId } = auth();
  if(!userId){
    // ログイン誘導（簡易）
    return <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-xl font-bold">海中（ニーズ保管庫）</h1>
      <p className="mt-2 text-slate-600">このページは登録ユーザーのみ閲覧できます。ログインしてください。</p>
      <a href="/sign-in" className="mt-4 inline-block px-4 py-2 rounded bg-sky-600 text-white">ログイン</a>
    </div>;
  }
  // 後でAPI接続: 浮上中/海底の2セクション
  return <div className="mx-auto max-w-6xl p-6 space-y-8">
    <h1 className="text-2xl font-bold">海中（ニーズ保管庫）</h1>
    <section>
      <h2 className="font-semibold mb-3">⬆︎ 浮上中</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* TODO: surfaced list */}
        <div className="p-4 border rounded text-slate-500">（浮上中のニーズがここに並びます）</div>
      </div>
    </section>
    <section>
      <h2 className="font-semibold mb-3">🌊 海底（通常）</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* TODO: archived list */}
        <div className="p-4 border rounded text-slate-500">（海中のニーズがここに並びます）</div>
      </div>
    </section>
  </div>;
}
