import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";

export default function NotFound(){
  return (
    <main className="min-h-[60vh] grid place-items-center p-8 text-center">
      <div>
        <h1 className="text-2xl font-bold mb-2">ページが見つかりません</h1>
        <p className="text-gray-600 mb-6">URLが正しいかご確認ください。</p>
        <div className="flex items-center justify-center gap-3">
          <a className="px-4 py-2 rounded bg-blue-600 text-white" href="/">ホームへ</a>
          <a className="px-4 py-2 rounded border" href="/needs">ニーズ一覧</a>
        </div>
      </div>
    </main>
  );
}
