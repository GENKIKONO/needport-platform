"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import LockedActionGuard from "@/components/LockedActionGuard";
import { SupportMeter } from "@/components/needs/SupportMeter";
import { guardedFetch } from "@/lib/auth/guard-client";

type NeedDetail = {
  id: string;
  title: string;
  body?: string;
  ownerMasked: string;
  stage: string;
  supporters: number;
  proposals: number;
  estimateYen?: number;
  isPublished: boolean;
  isSample: boolean;
  supportsCount?: number;
  createdAt: string;
  updatedAt: string;
};

// 賛同・お気に入りボタンコンポーネント
function Actions({ id, supportsCount: initial, flagsRequireAccount }: { id: string; supportsCount?: number; flagsRequireAccount: boolean }) {
  const [count, setCount] = useState(initial ?? 0);
  const [fav, setFav] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function support(on: boolean) {
    setLoading(true);
    try {
      const r = await guardedFetch(`/api/needs/${id}/support`, { method: on ? "POST" : "DELETE" });
      const j = await r.json(); 
      setCount(j.supportsCount ?? count);
      toast(on ? "賛同しました" : "賛同を解除しました", "success");
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        // ガード関数で既に処理済み
        return;
      }
      toast("賛同に失敗しました", "error");
    } finally {
      setLoading(false);
    }
  }

  async function favorite(on: boolean) {
    setLoading(true);
    try {
      const r = await guardedFetch(`/api/needs/${id}/favorite`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ on }) 
      });
      setFav(on); 
      toast(on ? "お気に入りに追加しました" : "お気に入りを解除しました", on ? "success" : "info");
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        // ガード関数で既に処理済み
        return;
      }
      toast("お気に入りに失敗しました", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LockedActionGuard flagsRequireAccount={flagsRequireAccount}>
      {(enabled, openModal) => (
        <div className="flex items-center gap-3 mt-4">
          <button 
            onClick={() => enabled ? support(true) : openModal()} 
            disabled={loading}
            className={`px-4 py-2 rounded-md disabled:opacity-50 ${
              enabled 
                ? "bg-sky-600 text-white hover:bg-sky-700" 
                : "bg-gray-200 text-gray-500"
            }`}
          >
            賛同する（{count}）
          </button>
          <button 
            onClick={() => enabled ? favorite(!fav) : openModal()} 
            disabled={loading}
            className={`px-4 py-2 rounded-md disabled:opacity-50 ${
              enabled 
                ? (fav 
                    ? "bg-amber-600 text-white hover:bg-amber-700" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200")
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {fav ? "★ お気に入り中" : "☆ お気に入り"}
          </button>
        </div>
      )}
    </LockedActionGuard>
  );
}

export default function NeedDetailPage() {
  const params = useParams();
  const [need, setNeed] = useState<NeedDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState({ requireAccountForEngagement: true });
  const toast = useToast();

  useEffect(() => {
    // フラグを取得
    fetch("/api/flags")
      .then(r => r.json())
      .then(setFlags)
      .catch(() => {});
  }, []);

  useEffect(() => {
    // 公開APIからデータを取得
    async function fetchNeed() {
      try {
        const res = await fetch('/api/needs');
        const data = await res.json();
        const found = data.items.find((n: NeedDetail) => n.id === params.id);
        if (found) {
          setNeed(found);
        }
      } catch (error) {
        console.error('Failed to fetch need:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchNeed();
    }
  }, [params.id]);

  useEffect(() => {
    // 閲覧数計測を発火
    if (params.id) {
      fetch(`/api/metrics/needs/${params.id}/view`, { method: 'POST' }).catch(() => {});
    }
  }, [params.id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast("URLをコピーしました", "success");
    } catch (error) {
      toast("コピーに失敗しました", "error");
    }
  };

  if (loading) {
    return (
      <main className="container max-w-4xl py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!need) {
    return (
      <main className="container max-w-4xl py-10">
        <div className="mb-4">
          <Link href="/needs" className="text-sm text-blue-600 hover:underline">
            ← 一覧へ戻る
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-red-600">ニーズが見つかりません</h1>
        <p className="mt-2 text-gray-600">このニーズは存在しないか、非公開になっています。</p>
      </main>
    );
  }

  return (
    <main className="container max-w-4xl py-10">
      <div className="mb-4">
        <Link href="/needs" className="text-sm text-blue-600 hover:underline">
          ← 一覧へ戻る
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold">{need.title}</h1>
          <button
            onClick={handleShare}
            className="ml-4 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            aria-label="このページを共有"
          >
            共有
          </button>
        </div>
        
        {/* SupportMeterをタイトル直下に配置 */}
        <div className="mb-4">
          <SupportMeter current={need.supportsCount ?? 0} goal={10} />
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
          <span>投稿者: {need.ownerMasked}</span>
          <span>•</span>
          <span>ステージ: {need.stage}</span>
          <span>•</span>
          <span>サポーター: {need.supporters}人</span>
          <span>•</span>
          <span>提案: {need.proposals}件</span>
          {need.estimateYen && (
            <>
              <span>•</span>
              <span>予算: ¥{need.estimateYen.toLocaleString()}</span>
            </>
          )}
        </div>

        {need.body && (
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{need.body}</p>
          </div>
        )}

        {/* 賛同・お気に入りボタン */}
        <Actions id={need.id} supportsCount={need.supportsCount} flagsRequireAccount={flags.requireAccountForEngagement} />

        <div className="text-xs text-gray-500 mt-6">
          作成日: {new Date(need.createdAt).toLocaleDateString('ja-JP')}
          {need.updatedAt !== need.createdAt && (
            <> • 更新日: {new Date(need.updatedAt).toLocaleDateString('ja-JP')}</>
          )}
        </div>
      </div>
    </main>
  );
}
