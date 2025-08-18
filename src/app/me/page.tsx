"use client";
import { useEffect, useState } from "react";
import MeEmpty from "@/components/me/MeEmpty";
import Link from "next/link";
import { NeedCard } from "@/components/needs/NeedCard";
import { guardedFetch } from "@/lib/auth/guard-client";

type Flags = { userEditEnabled: boolean; userDeleteEnabled: boolean; };
type Need = { id: string; title: string; description?: string; estimateYen?: number; updatedAt?: string; deletedAt?: string | null; };

// サンプルニーズ（デモ用）
const demoNeeds = [
  { id: "demo1", title: "地域の高齢者向け配食サービス", body: "一人暮らしの高齢者が安心して食事できる、温かく栄養バランスの良い配食サービスが欲しいです。", supportsCount: 15 },
  { id: "demo2", title: "子育て世代のための一時預かり", body: "急な用事やリフレッシュの時間を確保したい子育て世代のための、安心できる一時預かりサービスを探しています。", supportsCount: 8 },
];

export default function MePage() {
  const [flags, setFlags] = useState<Flags>({ userEditEnabled: true, userDeleteEnabled: true });
  const [items, setItems] = useState<Need[]>([]);
  const [editing, setEditing] = useState<Record<string, Partial<Need>>>({});
  const [loading, setLoading] = useState(false);
  const [lastDeletedId, setLastDeletedId] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const f = await fetch("/api/flags").then(r => r.json());
      setFlags({ userEditEnabled: f.userEditEnabled, userDeleteEnabled: f.userDeleteEnabled });
      const d = await fetch("/api/me/needs").then(r => r.json());
      setItems(d.items ?? []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function startEdit(id: string) { setEditing(e => ({ ...e, [id]: items.find(i => i.id === id) || {} })); }
  function cancelEdit(id: string) { setEditing(e => { const n = { ...e }; delete n[id]; return n; }); }

  async function save(id: string) {
    const patch = editing[id]; if (!patch) return;
    try {
      setLoading(true);
      const res = await guardedFetch(`/api/me/needs/${id}`, { 
        method: "PUT", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(patch) 
      });
      
      alert("保存しました");
      await load(); 
      cancelEdit(id);
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        alert("投稿者としてログインが必要です（/needs/new で投稿してください）");
        return;
      }
      if (error instanceof Error && error.message === "Locked") {
        alert("管理設定で編集が無効です");
        return;
      }
      alert("保存に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("この投稿を削除します。よろしいですか？")) return;
    try {
      setLoading(true);
      const res = await guardedFetch(`/api/me/needs/${id}`, { method: "DELETE" });
      
      setLastDeletedId(id);
      alert("削除しました（元に戻す）");
      await load();
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        alert("投稿者としてログインが必要です（/needs/new で投稿してください）");
        return;
      }
      if (error instanceof Error && error.message === "Locked") {
        alert("管理設定で削除が無効です");
        return;
      }
      alert("削除に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function restore(id: string) {
    try {
      setLoading(true);
      const res = await fetch(`/api/me/needs/${id}/restore`, { method: "POST" });
      
      if (res.status === 401) {
        alert("投稿者としてログインが必要です（/needs/new で投稿してください）");
        return;
      }
      if (res.status === 403) {
        alert("この投稿を復元する権限がありません");
        return;
      }
      if (!res.ok) { 
        alert("復元に失敗しました"); 
        return; 
      }
      
      alert("復元しました");
      setLastDeletedId(null);
      await load();
    } catch (error) {
      alert("処理に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">マイページ</h1>
        <p className="text-sm text-gray-500">読み込み中...</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold">マイページ</h1>
        <p className="text-sm text-gray-500">編集: {flags.userEditEnabled ? "有効" : "無効"} / 削除: {flags.userDeleteEnabled ? "有効" : "無効"}</p>
        <div className="mt-2">
          <a href="#" onClick={(e) => { e.preventDefault(); (window as any).__needport_open_claim?.(); }} className="text-sm text-blue-600 underline">
            別端末で続ける（メール連携）
          </a>
        </div>
      </header>
      
      {/* 復元ボタン */}
      {lastDeletedId && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">投稿を削除しました</p>
          <button 
            onClick={() => restore(lastDeletedId)}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            元に戻す
          </button>
        </div>
      )}
      
      {!items || items.length === 0 ? (
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border bg-white p-6">
              <h2 className="text-lg font-semibold">はじめかた</h2>
              <ol className="mt-3 list-decimal list-inside text-slate-700 space-y-1">
                <li><Link className="text-sky-700 underline" href="/needs/new">ニーズを投稿</Link> してみましょう</li>
                <li>管理により公開されると、みんなが賛同できます</li>
                <li>賛同が <b>10人</b> 集まると「出港」ステージへ</li>
              </ol>
            </div>
            <div className="rounded-2xl border bg-white p-6">
              <h2 className="text-lg font-semibold">こんな投稿が人気</h2>
              <div className="mt-3 space-y-3">
                {demoNeeds.slice(0,2).map(n => <NeedCard key={n.id} need={n} />)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(n => {
            const e = editing[n.id];
            return (
              <div key={n.id} className="rounded-xl border p-4">
                {!e ? (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{n.title}</h3>
                      <div className="flex gap-2">
                        <button 
                          disabled={!flags.userEditEnabled || loading} 
                          onClick={() => startEdit(n.id)} 
                          className="px-3 py-1 rounded border disabled:opacity-50"
                        >
                          編集
                        </button>
                        <button 
                          disabled={!flags.userDeleteEnabled || loading} 
                          onClick={() => remove(n.id)} 
                          className="px-3 py-1 rounded border text-red-600 disabled:opacity-50"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                    {n.description && <p className="mt-2 text-sm text-gray-700">{n.description}</p>}
                  </>
                ) : (
                  <>
                    <input 
                      className="w-full border rounded px-3 py-2" 
                      defaultValue={e.title ?? n.title}
                      onChange={ev => setEditing(s => ({ ...s, [n.id]: { ...s[n.id], title: ev.target.value } }))} 
                    />
                    <textarea 
                      className="mt-2 w-full border rounded px-3 py-2" 
                      rows={3}
                      defaultValue={e.description ?? n.description}
                      onChange={ev => setEditing(s => ({ ...s, [n.id]: { ...s[n.id], description: ev.target.value } }))} 
                    />
                    <div className="mt-3 flex gap-2">
                      <button 
                        onClick={() => save(n.id)} 
                        disabled={loading}
                        className="px-3 py-1 rounded bg-sky-600 text-white disabled:opacity-50"
                      >
                        保存
                      </button>
                      <button 
                        onClick={() => cancelEdit(n.id)} 
                        disabled={loading}
                        className="px-3 py-1 rounded border disabled:opacity-50"
                      >
                        取消
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
