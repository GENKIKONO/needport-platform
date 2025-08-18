import { type Stage, type NeedDetail, type NeedRow, type AdminStats } from "./types";
import { seedNeeds, toRows, calcStats } from "./mock";

let _needs: NeedDetail[] | null = null;
let _events: AdminEvent[] = [];

function ensure() { if (!_needs) _needs = seedNeeds(); return _needs!; }

function logEvent(type: string, id: string, payload?: any) {
  const event = { type, id, by: 'admin', at: new Date().toISOString(), payload };
  _events.unshift(event);
  if (_events.length > 1000) {
    _events = _events.slice(0, 1000);
  }
}

export const memoryStore = {
  listNeeds(params?: { q?: string; stage?: Stage | "all"; page?: number; pageSize?: number; }): { rows: NeedRow[]; total: number } {
    const all = ensure();
    let arr = all.slice();
    const { q, stage, page = 1, pageSize = 20 } = params ?? {};
    if (q) arr = arr.filter(n => (n.title + n.ownerMasked).toLowerCase().includes(q.toLowerCase()));
    if (stage && stage !== "all") arr = arr.filter(n => n.stage === stage);
    const total = arr.length;
    const rows = toRows(arr.slice((page - 1) * pageSize, page * pageSize));
    return { rows, total };
  },
  getNeed(id: string) { return ensure().find(n => n.id === id) ?? null; },
  updateStage(id: string, stage: Stage) {
    const arr = ensure(); const i = arr.findIndex(n => n.id === id);
    if (i === -1) return null;
    
    const currentStage = arr[i].stage;
    
    // ステージ遷移の制約チェック
    const allowedTransitions: Record<Stage, Stage[]> = {
      posted: ['gathering'],
      gathering: ['proposed'],
      proposed: ['approved'],
      approved: ['room'],
      room: ['in_progress'],
      in_progress: ['completed'],
      completed: [], // 完了後は変更不可
      disputed: [], // 異議後は変更不可
      refunded: [] // 返金後は変更不可
    };
    
    if (!allowedTransitions[currentStage]?.includes(stage)) {
      throw new Error(`Invalid stage transition: ${currentStage} → ${stage}`);
    }
    
    const oldStage = arr[i].stage;
    arr[i] = { 
      ...arr[i], 
      stage, 
      updatedAt: new Date().toISOString(),
      version: arr[i].version + 1
    };
    logEvent('stage_changed', id, { from: oldStage, to: stage });
    return arr[i];
  },
  updateExpert(id: string, verdict: "approved" | "rejected" | "pending") {
    const n = this.getNeed(id); if (!n) return null;
    n.expert = { status: verdict, at: new Date().toISOString() };
    n.updatedAt = new Date().toISOString();
    n.version = n.version + 1;
    logEvent('expert_updated', id, { verdict });
    return n;
  },
  updateEscrow(id: string, hold: boolean) {
    const n = this.getNeed(id); if (!n) return null;
    n.escrowHold = hold;
    n.updatedAt = new Date().toISOString();
    n.version = n.version + 1;
    logEvent('escrow_updated', id, { hold });
    return n;
  },
  createNeed(input: {
    title: string; body?: string; estimateYen?: number; ownerMasked?: string;
    isPublished?: boolean; isSample?: boolean;
  }): NeedDetail {
    const arr = ensure();
    const newNeed: NeedDetail = {
      id: `need_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: input.title,
      body: input.body,
      ownerMasked: input.ownerMasked ?? "ユーザ",
      stage: "posted",
      supporters: 0,
      proposals: 0,
      estimateYen: input.estimateYen,
      isPublished: input.isPublished ?? false,
      isSample: input.isSample ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    arr.push(newNeed);
    logEvent('need_created', newNeed.id, { title: input.title });
    return newNeed;
  },
  updateNeed(id: string, patch: Partial<Pick<
    NeedDetail,
    "title" | "body" | "estimateYen" | "stage" | "isPublished" | "isSample"
  >>): NeedDetail | null {
    const arr = ensure();
    const i = arr.findIndex(n => n.id === id);
    if (i === -1) return null;

    arr[i] = {
      ...arr[i],
      ...patch,
      updatedAt: new Date().toISOString(),
      version: arr[i].version + 1
    };
    logEvent('need_updated', id, patch);
    return arr[i];
  },
  listPublicNeeds(): NeedDetail[] {
    const all = ensure();
    return all.filter(n => n.isPublished || n.isSample);
  },
  stats(): AdminStats { 
    const baseStats = calcStats(ensure());
    return { ...baseStats, events: _events.slice(0, 5) };
  },
};
