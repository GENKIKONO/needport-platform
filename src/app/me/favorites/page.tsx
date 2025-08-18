"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type FavoriteNeed = {
  id: string;
  title: string;
  body?: string;
  estimateYen?: number;
  supportsCount?: number;
  stage: string;
  createdAt: string;
  updatedAt: string;
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteNeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFavorites() {
      try {
        setLoading(true);
        const response = await fetch("/api/me/favorites");
        if (!response.ok) {
          if (response.status === 401) {
            setError("ログインが必要です。まず投稿を作成してください。");
            return;
          }
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        setFavorites(data.items || []);
      } catch (err) {
        setError("お気に入りの読み込みに失敗しました");
        console.error("Failed to load favorites:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, []);

  if (loading) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">お気に入り</h1>
        <div className="text-sm text-gray-500">読み込み中...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">お気に入り</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
        <div className="mt-4">
          <Link href="/needs/new" className="text-blue-600 hover:underline">
            投稿を作成する →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">お気に入り</h1>
        <p className="text-sm text-gray-600 mt-1">
          お気に入りに追加したニーズを表示しています
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">お気に入りがありません</h3>
          <p className="text-gray-600 mb-4">
            ニーズ詳細ページで「お気に入り」ボタンを押すと、ここに表示されます
          </p>
          <Link 
            href="/needs" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            ニーズ一覧を見る
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((need) => {
            const excerpt = (need.body ?? "").replace(/\s+/g, " ").slice(0, 120);
            const meta = [
              new Date(need.updatedAt).toLocaleDateString(),
              `賛同 ${need.supportsCount ?? 0}`,
              need.estimateYen ? `目安 ¥${need.estimateYen.toLocaleString()}` : undefined,
            ].filter(Boolean).join("・");

            const stageColor =
              need.stage === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
              need.stage === "proposed" ? "bg-amber-50 text-amber-800 border-amber-200" :
              need.stage === "in_progress" ? "bg-sky-50 text-sky-700 border-sky-200" :
              "bg-slate-50 text-slate-700 border-slate-200";

            return (
              <article key={need.id} className="rounded-2xl border border-black/5 shadow-card bg-white p-4 hover:shadow-md transition">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${stageColor}`}>
                    {need.stage}
                  </span>
                  <span className="text-amber-600">★</span>
                </div>
                <h3 className="text-base font-semibold text-neutral-900 line-clamp-2">
                  <Link href={`/needs/${need.id}`} aria-label={`「${need.title}」の詳細を見る`} className="hover:underline">
                    {need.title}
                  </Link>
                </h3>
                {excerpt && (
                  <p className="mt-2 text-sm text-neutral-600 line-clamp-3">
                    {excerpt}{(need.body ?? "").length > 120 ? "…" : ""}
                  </p>
                )}
                <div className="mt-3 text-xs text-neutral-500">{meta}</div>
                <div className="mt-4">
                  <Link 
                    href={`/needs/${need.id}`} 
                    className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50"
                  >
                    詳細を見る
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
