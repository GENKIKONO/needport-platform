// 単一プロセス内で生存する簡易ストア（開発/プレビューで十分）
// 本番DB接続時はここを差し替えるだけで済む設計にする。
import { type Stage, type NeedDetail, type NeedRow, type AdminStats } from "./types";
import { seedNeeds, toRows, calcStats } from "./mock";

let _needs: NeedDetail[] | null = null;

function ensure() {
  if (!_needs) _needs = seedNeeds(); // 既存 mock.ts から初期化するファクトリ関数に変更
  return _needs!;
}

export function listNeeds(params?: { q?: string; stage?: Stage | "all"; page?: number; pageSize?: number; }): { rows: NeedRow[]; total: number; } {
  const all = ensure();
  let arr = all.slice();
  if (params?.q) {
    const k = params.q.toLowerCase();
    arr = arr.filter(n => (n.title + n.ownerMasked).toLowerCase().includes(k));
  }
  if (params?.stage && params.stage !== "all") {
    arr = arr.filter(n => n.stage === params.stage);
  }
  const total = arr.length;
  const page = params?.page ?? 1;
  const ps = params?.pageSize ?? 20;
  const rows = toRows(arr.slice((page - 1) * ps, page * ps));
  return { rows, total };
}

export function getNeed(id: string) {
  return ensure().find(n => n.id === id) ?? null;
}

export function updateStage(id: string, stage: Stage) {
  const arr = ensure();
  const i = arr.findIndex(n => n.id === id);
  if (i === -1) return null;
  arr[i] = { ...arr[i], stage, updatedAt: new Date().toISOString() };
  return arr[i];
}

export function updateExpert(id: string, verdict: "approved" | "rejected" | "pending") {
  const n = getNeed(id); if (!n) return null;
  n.expert = { status: verdict, at: new Date().toISOString() };
  n.updatedAt = new Date().toISOString();
  return n;
}

export function updateEscrow(id: string, hold: boolean) {
  const n = getNeed(id); if (!n) return null;
  n.escrowHold = hold;
  n.updatedAt = new Date().toISOString();
  return n;
}

export function stats(): AdminStats {
  return calcStats(ensure());
}
