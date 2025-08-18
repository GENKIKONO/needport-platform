"use client";
import { useState, useEffect } from "react";
import { KpiCards } from "@/components/admin/KpiCards";
import { type AdminStats } from "@/lib/admin/types";
import { yen, timeAgo } from "@/lib/admin/format";

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div>データの読み込みに失敗しました</div>;
  }

  const totalNeeds = Object.values(stats.byStage).reduce((a, b) => a + b, 0);
  const maxCount = Math.max(...Object.values(stats.byStage));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">概要</h1>
      
      <KpiCards stats={stats} />

      {/* Stage Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">ステージ別件数</h2>
        <div className="space-y-3">
          {Object.entries(stats.byStage).map(([stage, count]) => (
            <div key={stage} className="flex items-center">
              <div className="w-24 text-sm text-gray-600">
                {stage === "posted" && "投稿"}
                {stage === "gathering" && "賛同集め"}
                {stage === "proposed" && "提案受領"}
                {stage === "approved" && "承認済み"}
                {stage === "room" && "ルーム進行中"}
                {stage === "in_progress" && "作業実行中"}
                {stage === "completed" && "完了"}
                {stage === "disputed" && "異議"}
                {stage === "refunded" && "返金"}
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
              <div className="w-12 text-sm font-medium text-gray-900 text-right">
                {count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">最近のイベント</h2>
        <div className="space-y-3">
          {[
            { type: "stage_changed", needId: "N0001", from: "posted", to: "gathering", at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
            { type: "expert_requested", needId: "N0002", at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
            { type: "escrow_frozen", needId: "N0003", at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
          ].map((event, index) => (
            <div key={index} className="flex items-center text-sm text-gray-600">
              <span className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              </span>
              <span className="mr-2">{timeAgo(event.at)}</span>
              <span>
                {event.type === "stage_changed" && `${event.needId}: ${event.from} → ${event.to}`}
                {event.type === "expert_requested" && `${event.needId}: 専門家チェック依頼`}
                {event.type === "escrow_frozen" && `${event.needId}: エスクロー凍結`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
