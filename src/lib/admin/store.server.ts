import { kv } from "@vercel/kv";
import { type Stage, type NeedDetail, type NeedRow, type AdminStats } from "./types";
import { seedNeeds, toRows, calcStats } from "./mock";

const KEY = "admin:needs:v1"; // バージョン付きキーで将来の破壊的変更に備える

async function ensure(): Promise<NeedDetail[]> {
  let arr = await kv.get<NeedDetail[]>(KEY);
  if (!arr || !Array.isArray(arr)) {
    arr = seedNeeds();
    await kv.set(KEY, arr);
  }
  return arr;
}

async function save(arr: NeedDetail[]) { await kv.set(KEY, arr); }

async function logEvent(type: string, id: string, payload?: any) {
  try {
    const event = { type, id, by: 'admin', at: new Date().toISOString(), payload };
    await kv.lpush('admin:events', JSON.stringify(event));
    await kv.ltrim('admin:events', 0, 999); // 最大1000件に丸め
  } catch (error) {
    console.error('Failed to log event:', error);
  }
}

export const kvStore = {
  async listNeeds(params?: { q?: string; stage?: Stage | "all"; page?: number; pageSize?: number; }): Promise<{ rows: NeedRow[]; total: number }> {
    const all = await ensure();
    let arr = all.slice();
    const { q, stage, page = 1, pageSize = 20 } = params ?? {};
    if (q) arr = arr.filter(n => (n.title + n.ownerMasked).toLowerCase().includes(q.toLowerCase()));
    if (stage && stage !== "all") arr = arr.filter(n => n.stage === stage);
    const total = arr.length;
    const rows = toRows(arr.slice((page - 1) * pageSize, page * pageSize));
    return { rows, total };
  },
  async getNeed(id: string) {
    const all = await ensure();
    return all.find(n => n.id === id) ?? null;
  },
  async updateStage(id: string, stage: Stage) {
    const all = await ensure();
    const i = all.findIndex(n => n.id === id);
    if (i === -1) return null;
    
    const currentStage = all[i].stage;
    
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
    
    const oldStage = all[i].stage;
    all[i] = { 
      ...all[i], 
      stage, 
      updatedAt: new Date().toISOString(),
      version: all[i].version + 1
    };
    await save(all);
    await logEvent('stage_changed', id, { from: oldStage, to: stage });
    return all[i];
  },
  async updateExpert(id: string, verdict: "approved" | "rejected" | "pending") {
    const all = await ensure();
    const i = all.findIndex(n => n.id === id);
    if (i === -1) return null;
    all[i] = { 
      ...all[i], 
      expert: { status: verdict, at: new Date().toISOString() }, 
      updatedAt: new Date().toISOString(),
      version: all[i].version + 1
    };
    await save(all);
    await logEvent('expert_updated', id, { verdict });
    return all[i];
  },
  async updateEscrow(id: string, hold: boolean) {
    const all = await ensure();
    const i = all.findIndex(n => n.id === id);
    if (i === -1) return null;
    all[i] = { 
      ...all[i], 
      escrowHold: hold, 
      updatedAt: new Date().toISOString(),
      version: all[i].version + 1
    };
    await save(all);
    await logEvent('escrow_updated', id, { hold });
    return all[i];
  },
  async createNeed(input: {
    title: string; body?: string; estimateYen?: number; ownerMasked?: string;
    isPublished?: boolean; isSample?: boolean;
  }): Promise<NeedDetail> {
    const all = await ensure();
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
    all.push(newNeed);
    await save(all);
    await logEvent('need_created', newNeed.id, { title: input.title });
    return newNeed;
  },
  async updateNeed(id: string, patch: Partial<Pick<
    NeedDetail,
    "title" | "body" | "estimateYen" | "stage" | "isPublished" | "isSample"
  >>): Promise<NeedDetail | null> {
    const all = await ensure();
    const i = all.findIndex(n => n.id === id);
    if (i === -1) return null;

    all[i] = {
      ...all[i],
      ...patch,
      updatedAt: new Date().toISOString(),
      version: all[i].version + 1
    };
    await save(all);
    await logEvent('need_updated', id, patch);
    return all[i];
  },
  async listPublicNeeds(): Promise<NeedDetail[]> {
    const all = await ensure();
    return all.filter(n => n.isPublished || n.isSample);
  },
  async stats(): Promise<AdminStats> {
    const all = await ensure();
    const baseStats = calcStats(all);
    
    // 最近のイベントを取得
    try {
      const events = await kv.lrange('admin:events', 0, 4);
      const parsedEvents = events.map(e => JSON.parse(e)).reverse();
      return { ...baseStats, events: parsedEvents };
    } catch (error) {
      console.error('Failed to fetch events:', error);
      return { ...baseStats, events: [] };
    }
  },
};
