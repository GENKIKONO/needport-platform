import { type Stage, type NeedDetail, type NeedRow, type AdminStats, type VendorProfile } from "./types";
import { seedNeeds, toRows, calcStats } from "./mock";

// メモリストア
const _needs: NeedDetail[] = [];
const _supportsByNeed = new Map<string, Set<string>>();   // needId -> set(uid)
const _favoritesByUser = new Map<string, Set<string>>();  // uid -> set(needId)
const _vendors = new Map<string, VendorProfile>();

function ensure(): NeedDetail[] {
  if (_needs.length === 0) {
    // 初期データ
    _needs.push({
      id: "sample-1",
      title: "サンプル案件",
      body: "これはサンプル案件です。実際の案件ではありません。",
      ownerMasked: "サンプル",
      stage: "posted",
      supporters: 0,
      proposals: 0,
      estimateYen: 50000,
      isPublished: true,
      isSample: true,
      ownerUserId: "sample-user",
      supportsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    });
  }
  return _needs;
}

function logEvent(event: { type: string; needId?: string; meta?: any }) {
  console.log("Event:", event);
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
    const allowedTransitions: Record<Stage, Stage[]> = {
      posted: ['gathering'],
      gathering: ['proposed'],
      proposed: ['approved'],
      approved: ['room'],
      room: ['in_progress'],
      in_progress: ['completed'],
      completed: [],
      disputed: [],
      refunded: []
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
    logEvent({ type: 'stage_changed', needId: id, meta: { from: oldStage, to: stage } });
    return arr[i];
  },
  updateExpert(id: string, verdict: "approved" | "rejected" | "pending") {
    const n = this.getNeed(id); if (!n) return null;
    n.expert = { status: verdict, at: new Date().toISOString() };
    n.updatedAt = new Date().toISOString();
    n.version = n.version + 1;
    logEvent({ type: 'expert_updated', needId: id, meta: { verdict } });
    return n;
  },
  updateEscrow(id: string, hold: boolean) {
    const n = this.getNeed(id); if (!n) return null;
    n.escrowHold = hold;
    n.updatedAt = new Date().toISOString();
    n.version = n.version + 1;
    logEvent({ type: 'escrow_updated', needId: id, meta: { hold } });
    return n;
  },
  createNeed(input: {
    title: string; body?: string; estimateYen?: number; ownerMasked?: string;
    isPublished?: boolean; isSample?: boolean; ownerUserId?: string;
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
      ownerUserId: input.ownerUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    arr.push(newNeed);
    logEvent({ type: 'need_created', needId: newNeed.id, meta: { title: input.title } });
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
    logEvent({ type: 'need_updated', needId: id, meta: patch });
    return arr[i];
  },

  deleteNeed(id: string): boolean {
    const arr = ensure();
    const i = arr.findIndex(n => n.id === id);
    if (i === -1) return false;

    const need = arr[i];
    arr.splice(i, 1);
    logEvent({ type: 'need_deleted', needId: id, meta: { title: need.title } });
    return true;
  },

  async softDeleteNeed(id: string): Promise<boolean> {
    const arr = ensure();
    const i = arr.findIndex(n => n.id === id);
    if (i === -1) return false;
    if (arr[i].deletedAt) return true; // 既に削除済み扱い
    arr[i] = { 
      ...arr[i], 
      deletedAt: new Date().toISOString(), 
      version: (arr[i].version ?? 0) + 1, 
      updatedAt: new Date().toISOString() 
    };
    return true;
  },

  async restoreNeed(id: string): Promise<boolean> {
    const arr = ensure();
    const i = arr.findIndex(n => n.id === id);
    if (i === -1) return false;
    if (!arr[i].deletedAt) return true; // そもそも未削除
    arr[i] = { 
      ...arr[i], 
      deletedAt: null, 
      version: (arr[i].version ?? 0) + 1, 
      updatedAt: new Date().toISOString() 
    };
    return true;
  },

  listNeedsByOwner(ownerUserId: string, opts?: { includeDeleted?: boolean }): NeedRow[] {
    const all = ensure();
    const list = all.filter(n => 
      n.ownerUserId === ownerUserId && 
      (opts?.includeDeleted ? true : !n.deletedAt)
    );
    return list
      .map(need => ({
        id: need.id,
        title: need.title,
        ownerMasked: need.ownerMasked,
        ownerUserId: need.ownerUserId,
        stage: need.stage,
        supporters: need.supporters,
        proposals: need.proposals,
        estimateYen: need.estimateYen,
        isPublished: need.isPublished || false,
        isSample: need.isSample || false,
        deletedAt: need.deletedAt,
        createdAt: need.createdAt,
        updatedAt: need.updatedAt,
        payment: "none" as const,
        trust: {}
      }))
      .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
  },

  setPublished(id: string, isPublished: boolean): NeedDetail | null {
    const arr = ensure();
    const i = arr.findIndex(n => n.id === id);
    if (i === -1) return null;

    arr[i] = {
      ...arr[i],
      isPublished,
      updatedAt: new Date().toISOString(),
      version: arr[i].version + 1
    };
    logEvent({ type: 'published_changed', needId: id, meta: { value: isPublished } });
    return arr[i];
  },
  setSample(id: string, isSample: boolean): NeedDetail | null {
    const arr = ensure();
    const i = arr.findIndex(n => n.id === id);
    if (i === -1) return null;

    arr[i] = {
      ...arr[i],
      isSample,
      updatedAt: new Date().toISOString(),
      version: arr[i].version + 1
    };
    logEvent({ type: 'sample_changed', needId: id, meta: { value: isSample } });
    return arr[i];
  },
  incrementNeedView(id: string): number {
    // _views[id] = (_views[id] || 0) + 1; // _views は削除されたため、この行は削除
    return 0; // ビュー数は追跡しないため、0を返す
  },
  getNeedViews(id: string): number {
    return 0; // ビュー数は追跡しないため、0を返す
  },
  logEvent(event: { type: string; needId?: string; meta?: any }): void {
    logEvent(event);
  },
  createVendor(input: { name: string; email: string; note?: string }): any {
    const vendor = {
      id: `V${Date.now()}`,
      name: input.name,
      email: input.email,
      note: input.note,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    // _vendors.push(vendor); // この行は削除
    return vendor;
  },
  listVendors(): any[] {
    return Array.from(_vendors.values());
  },
  listPublicNeeds(): NeedDetail[] {
    const all = ensure();
    return all.filter(n => n.isPublished || n.isSample);
  },
  stats(): AdminStats {
    const baseStats = calcStats(ensure());
    return { ...baseStats, events: [] }; // イベントはメモリストアには保存しないため、空にする
  },

  async getVendorProfile(uid: string): Promise<VendorProfile | null> {
    return _vendors.get(uid) ?? null;
  },

  async upsertVendorProfile(uid: string, patch: Partial<VendorProfile>): Promise<VendorProfile> {
    const now = new Date().toISOString();
    const cur = _vendors.get(uid) ?? { id: uid };
    const next = { ...cur, ...patch, id: uid, updatedAt: now };
    _vendors.set(uid, next);
    return next;
  },

  async addSupport(needId: string, uid: string): Promise<number> {
    const set = _supportsByNeed.get(needId) ?? new Set<string>();
    set.add(uid);
    _supportsByNeed.set(needId, set);
    const count = set.size;
    // NeedDetail への反映
    const arr = ensure();
    const i = arr.findIndex(n => n.id === needId);
    if (i >= 0) arr[i] = { ...arr[i], supportsCount: count, updatedAt: new Date().toISOString() };
    return count;
  },

  async removeSupport(needId: string, uid: string): Promise<number> {
    const set = _supportsByNeed.get(needId) ?? new Set<string>();
    set.delete(uid);
    _supportsByNeed.set(needId, set);
    const count = set.size;
    const arr = ensure();
    const i = arr.findIndex(n => n.id === needId);
    if (i >= 0) arr[i] = { ...arr[i], supportsCount: count, updatedAt: new Date().toISOString() };
    return count;
  },

  async toggleFavorite(needId: string, uid: string, on: boolean): Promise<boolean> {
    const set = _favoritesByUser.get(uid) ?? new Set<string>();
    on ? set.add(needId) : set.delete(needId);
    _favoritesByUser.set(uid, set);
    return set.has(needId);
  },

  async listFavorites(uid: string): Promise<NeedDetail[]> {
    const ids = Array.from(_favoritesByUser.get(uid) ?? []);
    const arr = ensure();
    return arr.filter(n => ids.includes(n.id) && !n.deletedAt && n.isPublished && !n.isSample);
  },
};
