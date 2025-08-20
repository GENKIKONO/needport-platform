import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";

export default function NotFound(){
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold">ページが見つかりません</h1>
      <p className="mt-4 text-slate-600">以下から目的の情報に移動できます。</p>
      <ul className="mt-6 list-disc pl-6 text-sky-700">
        <li><a href="/needs">ニーズ一覧</a></li>
        <li><a href="/post">ニーズを投稿</a></li>
        <li><a href="/how-it-works">サービス航海図</a></li>
        <li><a href="/support">無料相談</a></li>
      </ul>
    </main>
  );
}
