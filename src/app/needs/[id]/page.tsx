"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

type NeedDetail = {
  id: string;
  title: string;
  summary?: string;
  body?: string;
  tags?: string[];
  area?: string;
  mode?: string;
  adopted_offer_id?: string;
  prejoin_count?: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    clerk_user_id: string;
  };
  disclosure?: {
    isFullyVisible: boolean;
    requiresPayment: boolean;
    message?: string;
  };
};

export default function NeedDetailPage() {
  const params = useParams();
  const [need, setNeed] = useState<NeedDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    // 個別APIからデータを取得（段階開示対応）
    async function fetchNeed() {
      try {
        const res = await fetch(`/api/needs/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setNeed(data);
        } else if (res.status === 404) {
          setNeed(null);
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
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
          <span>投稿者: {need.profiles ? '***' : '匿名'}</span>
          {need.area && (
            <>
              <span>•</span>
              <span>エリア: {need.area}</span>
            </>
          )}
          {need.mode && (
            <>
              <span>•</span>
              <span>モード: {need.mode}</span>
            </>
          )}
          {need.adopted_offer_id && (
            <>
              <span>•</span>
              <span className="text-green-600">採用済み</span>
            </>
          )}
        </div>

        {need.summary && (
          <div className="prose max-w-none mb-4">
            <p className="text-gray-700 font-medium">{need.summary}</p>
          </div>
        )}

        {need.body && (
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{need.body}</p>
          </div>
        )}

        {need.disclosure?.requiresPayment && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  詳細の閲覧にはマッチング決済が必要です
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{need.disclosure.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {need.tags && need.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {need.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500">
          作成日: {new Date(need.created_at).toLocaleDateString('ja-JP')}
          {need.updated_at !== need.created_at && (
            <> • 更新日: {new Date(need.updated_at).toLocaleDateString('ja-JP')}</>
          )}
        </div>
      </div>
    </main>
  );
}
