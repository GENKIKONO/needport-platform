"use client";
import { useEffect, useState } from "react";

type NeedCard = {
  id: string; title: string; body: string;
  stage: string; supportsCount?: number; estimateYen?: number;
};

export default function MeEmpty() {
  const [recs, setRecs] = useState<NeedCard[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/needs?page=1&pageSize=6", { cache: "no-store" });
        const { items } = await r.json();
        setRecs(items ?? []);
      } catch {}
    })();
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-md border p-6 bg-white">
        <h3 className="text-xl font-semibold mb-3">はじめての方へ</h3>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>まずは <a className="text-blue-600 underline" href="/needs/new">ニーズを投稿</a>（1分）</li>
          <li>事業者なら <a className="text-blue-600 underline" href="/me/vendor">事業者プロフィール</a> を登録</li>
          <li>紹介リンク経由での投稿で信頼度アップ（管理から発行可）</li>
          <li>別端末なら <a className="text-blue-600 underline" href="/me">マイページ</a> 上部の「メール連携」で引き継ぎ</li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="/needs/new" className="px-4 py-2 rounded bg-blue-600 text-white">ニーズを投稿する</a>
          <a href="/needs" className="px-4 py-2 rounded border">公開中のニーズを見る</a>
          <a href="/me/vendor" className="px-4 py-2 rounded border">事業者プロフィール</a>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">いま人気のニーズ</h3>
        {recs.length === 0 ? (
          <p className="text-sm text-gray-500">公開中のニーズを読み込み中…</p>
        ) : (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recs.map(n => (
              <article key={n.id} className="border rounded-md p-4 bg-white hover:shadow-sm transition">
                <h4 className="font-medium line-clamp-1">{n.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-3 mt-1">{n.body}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>賛同 {n.supportsCount ?? 0}</span>
                  <a href={`/needs/${n.id}`} className="text-blue-600 hover:underline">詳細を見る</a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
