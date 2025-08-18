import { kv } from "@vercel/kv";
import { type Stage, type NeedDetail, type NeedRow, type AdminStats, type AdminEvent } from "./types";
import { seedNeeds, toRows, calcStats } from "./mock";

// キー設計
const NEEDS_INDEX = "needs:index";
const VENDORS_INDEX = "vendors:index";
const EVENTS_KEY = "events";

function needKey(id: string) { return `need:${id}`; }
function vendorKey(id: string) { return `vendor:${id}`; }
function viewsKey(id: string) { return `views:need:${id}`; }

// 初期データの確保
async function ensureInitialData(): Promise<void> {
  const hasData = await kv.exists(NEEDS_INDEX);
  if (!hasData) {
    const initialNeeds = seedNeeds();
    for (const need of initialNeeds) {
      await kv.set(needKey(need.id), need);
      await kv.sadd(NEEDS_INDEX, need.id);
    }
  }
}

// イベントログ
async function logEvent(event: { type: string; needId?: string; meta?: any }): Promise<void> {
  try {
    const logEntry = {
      ...event,
      at: new Date().toISOString(),
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    await kv.lpush(EVENTS_KEY, JSON.stringify(logEntry));
    await kv.ltrim(EVENTS_KEY, 0, 999); // 最大1000件に制限
  } catch (error) {
    console.error('Failed to log event:', error);
  }
}

export const kvStore = {
  async createNeed(input: {
    title: string; body?: string; estimateYen?: number; ownerMasked?: string;
    isPublished?: boolean; isSample?: boolean; ownerUserId?: string;
  }): Promise<NeedDetail> {
    await ensureInitialData();
    
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

    await kv.set(needKey(newNeed.id), newNeed);
    await kv.sadd(NEEDS_INDEX, newNeed.id);
    await logEvent({ type: 'need_created', needId: newNeed.id, meta: { title: input.title } });
    
    return newNeed;
  },

  async updateNeed(id: string, patch: Partial<Pick<
    NeedDetail,
    "title" | "body" | "estimateYen" | "stage" | "isPublished" | "isSample"
  >>): Promise<NeedDetail | null> {
    const need = await kv.get<NeedDetail>(needKey(id));
    if (!need) return null;

    const updated = {
      ...need,
      ...patch,
      updatedAt: new Date().toISOString(),
      version: need.version + 1
    };

    await kv.set(needKey(id), updated);
    await logEvent({ type: 'need_updated', needId: id, meta: patch });
    
    return updated;
  },

  async listNeeds(params?: { q?: string; stage?: Stage | "all"; page?: number; pageSize?: number; }): Promise<{ rows: NeedRow[]; total: number }> {
    await ensureInitialData();
    
    const { q, stage, page = 1, pageSize = 20 } = params ?? {};
    const allIds = await kv.smembers(NEEDS_INDEX);
    
    // 全データを取得
    const allNeeds: NeedDetail[] = [];
    for (const id of allIds) {
      const need = await kv.get<NeedDetail>(needKey(id));
      if (need) allNeeds.push(need);
    }

    // フィルタリング
    let filtered = allNeeds;
    if (q) {
      filtered = filtered.filter(n => 
        (n.title + n.ownerMasked).toLowerCase().includes(q.toLowerCase())
      );
    }
    if (stage && stage !== "all") {
      filtered = filtered.filter(n => n.stage === stage);
    }

    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
    const rows = toRows(paginated);

    return { rows, total };
  },

  async getNeed(id: string): Promise<NeedDetail | null> {
    await ensureInitialData();
    return await kv.get<NeedDetail>(needKey(id));
  },

  async setPublished(id: string, isPublished: boolean): Promise<NeedDetail | null> {
    const need = await kv.get<NeedDetail>(needKey(id));
    if (!need) return null;

    const updated = {
      ...need,
      isPublished,
      updatedAt: new Date().toISOString(),
      version: need.version + 1
    };

    await kv.set(needKey(id), updated);
    await logEvent({ type: 'published_changed', needId: id, meta: { value: isPublished } });
    
    return updated;
  },

  async setSample(id: string, isSample: boolean): Promise<NeedDetail | null> {
    const need = await kv.get<NeedDetail>(needKey(id));
    if (!need) return null;

    const updated = {
      ...need,
      isSample,
      updatedAt: new Date().toISOString(),
      version: need.version + 1
    };

    await kv.set(needKey(id), updated);
    await logEvent({ type: 'sample_changed', needId: id, meta: { value: isSample } });
    
    return updated;
  },

  async incrementNeedView(id: string): Promise<number> {
    const key = viewsKey(id);
    const views = await kv.incr(key);
    await kv.expire(key, 60 * 60 * 24 * 365); // 1年で期限切れ
    return views;
  },

  async getNeedViews(id: string): Promise<number> {
    const key = viewsKey(id);
    const views = await kv.get<number>(key);
    return views ?? 0;
  },

  async logEvent(event: { type: string; needId?: string; meta?: any }): Promise<void> {
    await logEvent(event);
  },

  async createVendor(input: { name: string; email: string; note?: string }): Promise<any> {
    const vendor = {
      id: `V${Date.now()}`,
      name: input.name,
      email: input.email,
      note: input.note,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    await kv.set(vendorKey(vendor.id), vendor);
    await kv.sadd(VENDORS_INDEX, vendor.id);
    
    return vendor;
  },

  async listVendors(): Promise<any[]> {
    const allIds = await kv.smembers(VENDORS_INDEX);
    const vendors = [];
    for (const id of allIds) {
      const vendor = await kv.get(vendorKey(id));
      if (vendor) vendors.push(vendor);
    }
    return vendors;
  },

  async listPublicNeeds(): Promise<NeedDetail[]> {
    await ensureInitialData();
    
    const allIds = await kv.smembers(NEEDS_INDEX);
    const publicNeeds: NeedDetail[] = [];
    
    for (const id of allIds) {
      const need = await kv.get<NeedDetail>(needKey(id));
      if (need && (need.isPublished || need.isSample)) {
        publicNeeds.push(need);
      }
    }
    
    return publicNeeds;
  },

  async updateStage(id: string, stage: Stage): Promise<NeedDetail | null> {
    const need = await kv.get<NeedDetail>(needKey(id));
    if (!need) return null;

    const currentStage = need.stage;
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

    const updated = {
      ...need,
      stage,
      updatedAt: new Date().toISOString(),
      version: need.version + 1
    };

    await kv.set(needKey(id), updated);
    await logEvent({ type: 'stage_changed', needId: id, meta: { from: currentStage, to: stage } });
    
    return updated;
  },

  async updateExpert(id: string, verdict: "approved" | "rejected" | "pending"): Promise<NeedDetail | null> {
    const need = await kv.get<NeedDetail>(needKey(id));
    if (!need) return null;

    const updated = {
      ...need,
      expert: { status: verdict, at: new Date().toISOString() },
      updatedAt: new Date().toISOString(),
      version: need.version + 1
    };

    await kv.set(needKey(id), updated);
    await logEvent({ type: 'expert_updated', needId: id, meta: { verdict } });
    
    return updated;
  },

  async updateEscrow(id: string, hold: boolean): Promise<NeedDetail | null> {
    const need = await kv.get<NeedDetail>(needKey(id));
    if (!need) return null;

    const updated = {
      ...need,
      escrowHold: hold,
      updatedAt: new Date().toISOString(),
      version: need.version + 1
    };

    await kv.set(needKey(id), updated);
    await logEvent({ type: 'escrow_updated', needId: id, meta: { hold } });
    
    return updated;
  },

  async deleteNeed(id: string): Promise<boolean> {
    const need = await kv.get<NeedDetail>(needKey(id));
    if (!need) return false;

    await kv.del(needKey(id));
    await kv.srem(NEEDS_INDEX, id);
    await logEvent({ type: 'need_deleted', needId: id, meta: { title: need.title } });
    return true;
  },

  async softDeleteNeed(id: string): Promise<boolean> {
    const need = await kv.get<NeedDetail>(needKey(id));
    if (!need) return false;
    if (need.deletedAt) return true; // 既に削除済み扱い

    const updated = {
      ...need,
      deletedAt: new Date().toISOString(),
      version: (need.version ?? 0) + 1,
      updatedAt: new Date().toISOString()
    };
    await kv.set(needKey(id), updated);
    return true;
  },

  async restoreNeed(id: string): Promise<boolean> {
    const need = await kv.get<NeedDetail>(needKey(id));
    if (!need) return false;
    if (!need.deletedAt) return true; // そもそも未削除

    const updated = {
      ...need,
      deletedAt: null,
      version: (need.version ?? 0) + 1,
      updatedAt: new Date().toISOString()
    };
    await kv.set(needKey(id), updated);
    return true;
  },

  async listNeedsByOwner(ownerUserId: string, opts?: { includeDeleted?: boolean }): Promise<NeedRow[]> {
    await ensureInitialData();
    
    const allIds = await kv.smembers(NEEDS_INDEX);
    const needs: NeedRow[] = [];
    
    for (const id of allIds) {
      const need = await kv.get<NeedDetail>(needKey(id));
      if (need && 
          need.ownerUserId === ownerUserId && 
          (opts?.includeDeleted ? true : !need.deletedAt)) {
        needs.push({
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
          payment: "none",
          trust: {}
        });
      }
    }
    
    return needs.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
  },

  async stats(): Promise<AdminStats> {
    await ensureInitialData();
    
    const allIds = await kv.smembers(NEEDS_INDEX);
    const allNeeds: NeedDetail[] = [];
    
    for (const id of allIds) {
      const need = await kv.get<NeedDetail>(needKey(id));
      if (need) allNeeds.push(need);
    }

    const baseStats = calcStats(allNeeds);

    try {
      const events = await kv.lrange(EVENTS_KEY, 0, 19); // 最新20件
      const parsedEvents = events.map(e => JSON.parse(e)).reverse();
      return { ...baseStats, events: parsedEvents };
    } catch (error) {
      console.error('Failed to fetch events:', error);
      return { ...baseStats, events: [] };
    }
  },
};
