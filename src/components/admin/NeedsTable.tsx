"use client";
import { useState, useEffect, useCallback } from "react";
import { type NeedRow, type Stage } from "@/lib/admin/types";
import { StageBadge, PaymentBadge } from "./StatusBadge";
import StageStepper from "./StageStepper";
import TrustBadge from "./TrustBadge";
import { useToast } from "@/components/ui/Toast";
import { yen, timeAgo } from "@/lib/admin/format";

export function NeedsTable() {
  const [needs, setNeeds] = useState<NeedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<Stage | "">("");
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);

  useEffect(() => {
    fetchNeeds();
  }, [search, stageFilter]);

  async function fetchNeeds() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (stageFilter) params.set("stage", stageFilter);
      
      const response = await fetch(`/api/admin/needs?${params}`);
      const data = await response.json();
      setNeeds(data.rows || []);
    } catch (error) {
      console.error("Failed to fetch needs:", error);
    } finally {
      setLoading(false);
    }
  }

  const stages: { value: Stage; label: string }[] = [
    { value: "posted", label: "投稿" },
    { value: "gathering", label: "賛同集め" },
    { value: "proposed", label: "提案受領" },
    { value: "approved", label: "承認済み" },
    { value: "room", label: "ルーム進行中" },
    { value: "in_progress", label: "作業実行中" },
    { value: "completed", label: "完了" },
    { value: "disputed", label: "異議" },
    { value: "refunded", label: "返金" },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as Stage | "")}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全ステージ</option>
            {stages.map(stage => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </select>
          <a
            href="/api/admin/needs/export"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-center"
          >
            CSV出力
          </a>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タイトル</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ユーザー</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">信頼</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステージ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">賛同</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提案</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">見積</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">閲覧数</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">支払い</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">更新</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={11} className="px-6 py-4 text-center text-gray-500">
                  読み込み中...
                </td>
              </tr>
            ) : needs.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-4 text-center text-gray-500">
                  データが見つかりません
                </td>
              </tr>
            ) : (
              needs.map((need) => (
                <tr 
                  key={need.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedNeed(need.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {need.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {need.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {need.ownerMasked}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TrustBadge userId={(need as any).ownerUserId} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StageBadge stage={need.stage} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {need.supportsCount ?? need.supporters}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {need.proposals}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {need.estimateYen ? yen(need.estimateYen) : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(need as any).views || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PaymentBadge status={need.payment} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {timeAgo(need.updatedAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Need Detail Drawer */}
      {selectedNeed && (
        <NeedDrawer 
          needId={selectedNeed} 
          onClose={() => setSelectedNeed(null)} 
        />
      )}
    </div>
  );
}

function NeedDrawer({ needId, onClose }: { needId: string; onClose: () => void }) {
  const [need, setNeed] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState<{url:string; createdAt:string}[]>([]);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchNeed();
  }, [needId]);

  useEffect(() => {
    loadRefHistory();
  }, [needId]);

  async function fetchNeed() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/needs/${needId}`);
      const data = await response.json();
      setNeed(data);
    } catch (error) {
      console.error("Failed to fetch need:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadRefHistory() {
    try {
      const res = await fetch(`/api/admin/referrals?needId=${needId}&limit=5`, { credentials: "include" });
      if (!res.ok) return;
      const json = await res.json();
      setInvites(json.items ?? []);
    } catch {}
  }

  async function createInvite() {
    try {
      setLoadingInvite(true);
      const res = await fetch(`/api/referrals/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referrerId: "admin", expiresInDays: 7, needId: needId })
      });
      if (!res.ok) throw new Error("failed");
      const json = await res.json();
      await navigator.clipboard.writeText(json.inviteUrl);
      toast("紹介リンクをコピーしました", "success");
      loadRefHistory();
    } catch (e) {
      toast("紹介リンクの作成に失敗しました", "error");
    } finally {
      setLoadingInvite(false);
    }
  }

  async function mutateStage(id: string, next: Stage) {
    // 楽観更新: 先に UI を反映、その後 API で確定
    const prev = need;
    setNeed(n => n ? { ...n, stage: next } : n);
    try {
      const response = await fetch(`/api/admin/needs/${id}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: next }),
      });
      
      if (!response.ok) {
        // 409: 紹介が必要
        if (response.status === 409) {
          const j = await response.json().catch(() => ({}));
          alert(j?.message || "紹介が必要です。紹介URLを発行してユーザに共有してください。");
        } else {
          alert("更新に失敗しました");
        }
        setNeed(prev); // 楽観反映を戻す
        return;
      }
      
      // 再フェッチで正値に整える
      fetchNeed();
    } catch (error) {
      console.error("Stage update failed:", error);
      setNeed(prev); // 楽観反映を戻す
      alert("通信エラーが発生しました");
    }
  }

  async function handleAction(action: string, data?: any) {
    try {
      const response = await fetch(`/api/admin/needs/${needId}/${action}`, {
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-lg">
          読み込み中...
        </div>
      </div>
    );
  }

  if (!need) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end z-50">
      <div className="bg-white w-full max-w-2xl h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{need.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <StageStepper stage={need.stage} />

          {/* Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">アクション</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => mutateStage(need.id, "approved")}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                承認する
              </button>
              <button
                onClick={() => mutateStage(need.id, "room")}
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
              <button
                onClick={createInvite}
                disabled={loadingInvite}
                className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-white hover:bg-sky-700 disabled:opacity-60"
              >
                {loadingInvite ? "発行中..." : "紹介リンク発行"}
              </button>
            </div>
          </div>

          {/* 過去の紹介リンク（最新5件） */}
          <div className="mb-6">
            <div className="text-xs font-semibold text-gray-500 mb-2">過去の紹介リンク（最新5件）</div>
            <ul className="space-y-2">
              {invites.length === 0 && (
                <li className="text-xs text-gray-400">まだ発行履歴はありません</li>
              )}
              {invites.map((it, idx) => (
                <li key={idx} className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-gray-700" title={it.url}>
                    {new Date(it.createdAt).toLocaleString()} — {it.url}
                  </span>
                  <button
                    onClick={async () => { await navigator.clipboard.writeText(it.url); toast("コピーしました", "success"); }}
                    className="rounded border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50"
                  >
                    コピー
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">信頼情報</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span>ユーザー: {need.ownerMasked}</span>
                <TrustBadge userId={(need as any).ownerUserId} />
              </div>
              {need.trust?.anchorName && (
                <div>紹介者: {need.trust.anchorName}</div>
              )}
              {need.trust?.anchorReputation && (
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
              <div>専門家チェック: {need.trust?.expertVerified ? "済み" : "未"}</div>
              <div>運営保留: {need.trust?.creditHold ? "あり" : "なし"}</div>
            </div>
          </div>

          {/* Events Timeline */}
          <div>
            <h3 className="text-lg font-semibold mb-2">イベント履歴</h3>
            <div className="space-y-2">
              {need.events?.map((event: any, index: number) => (
                <div key={index} className="text-sm text-gray-600">
                  {timeAgo(event.at)}: {event.type}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}