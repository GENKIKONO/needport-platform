"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";

type NeedRow = {
  id: string;
  title: string;
  body?: string;
  stage: string;
  supporters: number;
  proposals: number;
  estimateYen?: number | null;
  isPublished: boolean;
  isSample: boolean;
  createdAt: string;
  updatedAt: string;
};

type Resp = {
  items: NeedRow[];
  total: number;
  page: number;
  pageSize: number;
};

type FeatureFlags = {
  userEditEnabled: boolean;
  userDeleteEnabled: boolean;
  vendorEditEnabled: boolean;
  demoGuardEnabled: boolean;
  showSamples: boolean;
};

export default function MePage() {
  const [data, setData] = useState<Resp | null>(null);
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", body: "", estimateYen: "" });
  const toast = useToast();

  async function loadData() {
    try {
      setLoading(true);
      setErr(null);
      
      // フラグ取得
      const flagsRes = await fetch("/api/flags");
      if (flagsRes.ok) {
        const flagsData = await flagsRes.json();
        setFlags(flagsData);
      }
      
      // マイニーズ取得
      const res = await fetch("/api/me/needs?pageSize=50");
      if (!res.ok) {
        if (res.status === 401) {
          setErr("投稿がまだありません。まずニーズを投稿してください。");
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json() as Resp;
      setData(json);
    } catch (e: any) {
      setErr(e?.message ?? "failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const handleEdit = (need: NeedRow) => {
    setEditingId(need.id);
    setEditForm({
      title: need.title,
      body: need.body || "",
      estimateYen: need.estimateYen?.toString() || "",
    });
  };

  const handleSave = async () => {
    if (!editingId) return;
    
    try {
      const res = await fetch(`/api/me/needs/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          body: editForm.body || undefined,
          estimateYen: editForm.estimateYen ? Number(editForm.estimateYen) : undefined,
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        if (error.error === "feature_disabled") {
          toast("編集機能が無効になっています", "error");
        } else {
          toast("更新に失敗しました", "error");
        }
        return;
      }
      
      toast("更新しました", "success");
      setEditingId(null);
      loadData(); // 再読み込み
    } catch (error) {
      toast("更新に失敗しました", "error");
    }
  };

  const handleDelete = async (needId: string, title: string) => {
    if (!confirm(`「${title}」を削除しますか？`)) return;
    
    try {
      const res = await fetch(`/api/me/needs/${needId}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const error = await res.json();
        if (error.error === "feature_disabled") {
          toast("削除機能が無効になっています", "error");
        } else {
          toast("削除に失敗しました", "error");
        }
        return;
      }
      
      toast("削除しました", "success");
      loadData(); // 再読み込み
    } catch (error) {
      toast("削除に失敗しました", "error");
    }
  };

  const items = data?.items ?? [];

  if (loading) {
    return (
      <main className="container py-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-6">マイページ</h1>
        <div className="text-sm text-neutral-500">読み込み中...</div>
      </main>
    );
  }

  if (err) {
    return (
      <main className="container py-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-6">マイページ</h1>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <p className="mb-2">{err}</p>
          <a href="/needs/new" className="text-blue-600 hover:underline">
            ニーズを投稿する →
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-8">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-6">マイページ</h1>
      
      {flags?.demoGuardEnabled && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 text-sm">
          デモモードが有効になっています。一部の機能が制限される場合があります。
        </div>
      )}
      
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-neutral-900">投稿したニーズ</h2>
        
        {items.length === 0 ? (
          <div className="rounded-xl border border-black/5 bg-white p-6 text-neutral-600">
            まだ投稿したニーズはありません。
            <a href="/needs/new" className="ml-2 text-blue-600 hover:underline">
              ニーズを投稿する →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((need) => (
              <div key={need.id} className="rounded-lg border border-gray-200 bg-white p-4">
                {editingId === need.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="タイトル"
                    />
                    <textarea
                      value={editForm.body}
                      onChange={(e) => setEditForm(prev => ({ ...prev, body: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                      placeholder="詳細"
                    />
                    <input
                      type="number"
                      value={editForm.estimateYen}
                      onChange={(e) => setEditForm(prev => ({ ...prev, estimateYen: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="予算（円）"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-medium text-neutral-900">{need.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(need)}
                          disabled={!flags?.userEditEnabled}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(need.id, need.title)}
                          disabled={!flags?.userDeleteEnabled}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                    
                    {need.body && (
                      <p className="text-sm text-neutral-600 mb-2">{need.body}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <span>ステージ: {need.stage}</span>
                      <span>•</span>
                      <span>公開: {need.isPublished ? "ON" : "OFF"}</span>
                      <span>•</span>
                      <span>賛同: {need.supporters}人</span>
                      <span>•</span>
                      <span>提案: {need.proposals}件</span>
                      {need.estimateYen && (
                        <>
                          <span>•</span>
                          <span>予算: ¥{need.estimateYen.toLocaleString()}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>作成: {new Date(need.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
