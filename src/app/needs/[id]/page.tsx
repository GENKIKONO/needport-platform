"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
  createdAt: string;
  updatedAt: string;
};

export default function NeedDetailPage() {
  const params = useParams();
  const [need, setNeed] = useState<NeedDetail | null>(null);
  const [loading, setLoading] = useState(true);

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
        <h1 className="text-2xl font-bold text-red-600">ニーズが見つかりません</h1>
        <p className="mt-2 text-gray-600">このニーズは存在しないか、非公開になっています。</p>
      </main>
    );
  }

  return (
    <main className="container max-w-4xl py-10">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-3xl font-bold mb-4">{need.title}</h1>
        
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

        <div className="text-xs text-gray-500">
          作成日: {new Date(need.createdAt).toLocaleDateString('ja-JP')}
          {need.updatedAt !== need.createdAt && (
            <> • 更新日: {new Date(need.updatedAt).toLocaleDateString('ja-JP')}</>
          )}
        </div>
      </div>
    </main>
  );
}
