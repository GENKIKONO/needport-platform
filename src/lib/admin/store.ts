import { type Stage, type NeedDetail, type NeedRow, type AdminStats } from "./types";

const hasKV = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
export * from "./types";

// Helper function for dynamic import
async function getStore() {
  if (hasKV) {
    const { kvStore } = await import("./store.server");
    return kvStore;
  } else {
    const { memoryStore } = await import("./store.memory");
    return memoryStore;
  }
}

// Re-export individual functions for backward compatibility
export async function listNeeds(params?: { q?: string; stage?: Stage | "all"; page?: number; pageSize?: number; }): Promise<{ rows: NeedRow[]; total: number }> {
  const store = await getStore();
  return store.listNeeds(params);
}

export async function getNeed(id: string): Promise<NeedDetail | null> {
  const store = await getStore();
  return store.getNeed(id);
}

export async function updateStage(id: string, stage: Stage): Promise<NeedDetail | null> {
  const store = await getStore();
  return store.updateStage(id, stage);
}

export async function updateExpert(id: string, verdict: "approved" | "rejected" | "pending"): Promise<NeedDetail | null> {
  const store = await getStore();
  return store.updateExpert(id, verdict);
}

export async function updateEscrow(id: string, hold: boolean): Promise<NeedDetail | null> {
  const store = await getStore();
  return store.updateEscrow(id, hold);
}

export async function stats(): Promise<AdminStats> {
  const store = await getStore();
  return store.stats();
}

export async function createNeed(input: {
  title: string; body?: string; estimateYen?: number; ownerMasked?: string;
  isPublished?: boolean; isSample?: boolean;
}): Promise<NeedDetail> {
  const store = await getStore();
  return store.createNeed(input);
}

export async function updateNeed(id: string, patch: Partial<Pick<
  NeedDetail,
  "title" | "body" | "estimateYen" | "stage" | "isPublished" | "isSample"
>>): Promise<NeedDetail | null> {
  const store = await getStore();
  return store.updateNeed(id, patch);
}

export async function listPublicNeeds(): Promise<NeedDetail[]> {
  const store = await getStore();
  return store.listPublicNeeds();
}

export async function setPublished(id: string, isPublished: boolean): Promise<NeedDetail | null> {
  const store = await getStore();
  return store.setPublished(id, isPublished);
}

export async function setSample(id: string, isSample: boolean): Promise<NeedDetail | null> {
  const store = await getStore();
  return store.setSample(id, isSample);
}

export async function incrementNeedView(id: string): Promise<number> {
  const store = await getStore();
  return store.incrementNeedView(id);
}

export async function getNeedViews(id: string): Promise<number> {
  const store = await getStore();
  return store.getNeedViews(id);
}

export async function logEvent(event: { type: string; needId?: string; meta?: any }): Promise<void> {
  const store = await getStore();
  return store.logEvent(event);
}

export async function createVendor(input: { name: string; email: string; note?: string }): Promise<any> {
  const store = await getStore();
  return store.createVendor(input);
}

export async function listVendors(): Promise<any[]> {
  const store = await getStore();
  return store.listVendors();
}
