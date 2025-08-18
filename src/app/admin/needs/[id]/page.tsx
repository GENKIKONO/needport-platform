"use client";
import { useState, useEffect } from "react";
import StageStepper from "@/components/admin/StageStepper";
import { yen, timeAgo } from "@/lib/admin/format";
import { type NeedDetail } from "@/lib/admin/types";

export default function AdminNeedDetailPage({ params }: { params: { id: string } }) {
  const [need, setNeed] = useState<NeedDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNeed();
  }, [params.id]);

  async function fetchNeed() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/needs/${params.id}`);
      const data = await response.json();
      setNeed(data);
    } catch (error) {
      console.error("Failed to fetch need:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action: string, data?: any) {
    try {
      const response = await fetch(`/api/admin/needs/${params.id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data || {}),
      });
      const result = await response.json();
      alert(result.message || "アクションが完了しました");
      fetchNeed(); // Refresh data
    } catch (error) {
      console.error("Action failed:", error);
      alert("アクションに失敗しました");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (!need) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">ニーズが見つかりません</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{need.title}</h1>
        <div className="text-sm text-gray-500">ID: {need.id}</div>
      </div>

      <StageStepper stage={need.stage} />

      {/* Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">アクション</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleAction("stage", { stage: "approved" })}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            承認する
          </button>
          <button
            onClick={() => handleAction("stage", { stage: "room" })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ルーム開始
          </button>
          <button
            onClick={() => handleAction("expert", { action: "verify" })}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            専門家チェック依頼
          </button>
          <button
            onClick={() => handleAction("escrow", { action: "freeze" })}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            エスクロー凍結
          </button>
        </div>
      </div>

      {/* Trust Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">信頼情報</h2>
        <div className="space-y-2">
          {need.trust.anchorName && (
            <div>紹介者: {need.trust.anchorName}</div>
          )}
          {need.trust.anchorReputation && (
            <div>
              評価: {need.trust.anchorReputation}/100
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${need.trust.anchorReputation}%` }}
                />
              </div>
            </div>
          )}
          <div>専門家チェック: {need.trust.expertVerified ? "済み" : "未"}</div>
          <div>運営保留: {need.trust.creditHold ? "あり" : "なし"}</div>
        </div>
      </div>

      {/* Events Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">イベント履歴</h2>
        <div className="space-y-2">
          {need.events?.map((event, index) => (
            <div key={index} className="text-sm text-gray-600">
              {timeAgo(event.at)}: {event.type}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
