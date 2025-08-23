"use client";
import { useEffect, useState } from "react";
import { getUserNeeds, Need } from "@/lib/needs/lifecycle";
import { getDevSession } from "@/lib/devAuth";
import LifecycleActions from "@/components/needs/LifecycleActions";

type Flags = { userEditEnabled: boolean; userDeleteEnabled: boolean; };

export default function MePage() {
  const [flags, setFlags] = useState<Flags>({ userEditEnabled: true, userDeleteEnabled: true });
  const [items, setItems] = useState<Need[]>([]);
  const [editing, setEditing] = useState<Record<string, Partial<Need>>>({});

  async function load() {
    const f = await fetch("/api/flags").then(r => r.json());
    setFlags({ userEditEnabled: f.userEditEnabled, userDeleteEnabled: f.userDeleteEnabled });
    
    const devSession = getDevSession();
    if (devSession) {
      const needs = await getUserNeeds(devSession.userId);
      setItems(needs);
    }
  }
  useEffect(() => { load(); }, []);

  function startEdit(id: string) { setEditing(e => ({ ...e, [id]: items.find(i => i.id === id) || {} })); }
  function cancelEdit(id: string) { setEditing(e => { const n = { ...e }; delete n[id]; return n; }); }

  async function save(id: string) {
    const patch = editing[id]; if (!patch) return;
    const res = await fetch(`/api/me/needs/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    if (res.status === 423) { alert("管理設定で編集が無効です"); return; }
    if (!res.ok) { alert("保存に失敗しました"); return; }
    await load(); cancelEdit(id);
  }

  async function remove(id: string) {
    if (!confirm("この投稿を削除します。よろしいですか？")) return;
    const res = await fetch(`/api/me/needs/${id}`, { method: "DELETE" });
    if (res.status === 423) { alert("管理設定で削除が無効です"); return; }
    if (!res.ok) { alert("削除に失敗しました"); return; }
    await load();
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">マイページ</h1>
      <p className="mb-6 text-sm text-gray-600">
        編集: <b>{flags.userEditEnabled ? "有効" : "無効"}</b> / 削除: <b>{flags.userDeleteEnabled ? "有効" : "無効"}</b>
      </p>
      <div className="space-y-4">
        {items.map(n => {
          const e = editing[n.id];
          return (
            <div key={n.id} className="rounded-xl border p-4">
              {!e ? (
                <>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{n.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        作成日: {new Date(n.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button disabled={!flags.userEditEnabled} onClick={() => startEdit(n.id)} className="px-3 py-1 rounded border">
                        編集
                      </button>
                      <button disabled={!flags.userDeleteEnabled} onClick={() => remove(n.id)} className="px-3 py-1 rounded border text-red-600">
                        削除
                      </button>
                    </div>
                  </div>
                  
                  {/* ライフサイクル操作 */}
                  <div className="mt-4 pt-4 border-t">
                    <LifecycleActions
                      needId={n.id}
                      status={n.status}
                      onSuccess={load}
                    />
                  </div>
                </>
              ) : (
                <>
                  <input className="w-full border rounded px-3 py-2" defaultValue={e.title ?? n.title}
                    onChange={ev => setEditing(s => ({ ...s, [n.id]: { ...s[n.id], title: ev.target.value } }))} />
                  <textarea className="mt-2 w-full border rounded px-3 py-2" rows={3}
                    defaultValue={e.description ?? n.description}
                    onChange={ev => setEditing(s => ({ ...s, [n.id]: { ...s[n.id], description: ev.target.value } }))} />
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => save(n.id)} className="px-3 py-1 rounded bg-sky-600 text-white">保存</button>
                    <button onClick={() => cancelEdit(n.id)} className="px-3 py-1 rounded border">取消</button>
                  </div>
                </>
              )}
            </div>
          );
        })}
        {items.length === 0 && <p className="text-sm text-gray-500">あなたの投稿はまだありません。</p>}
      </div>
    </main>
  );
}
