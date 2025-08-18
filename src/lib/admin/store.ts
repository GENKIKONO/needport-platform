import { type Stage, type NeedDetail, type NeedRow, type AdminStats, type VendorProfile } from "./types";

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
  isPublished?: boolean; isSample?: boolean; ownerUserId?: string;
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

export async function deleteNeed(id: string): Promise<boolean> {
  const store = await getStore();
  return store.deleteNeed(id);
}

export async function softDeleteNeed(id: string): Promise<boolean> {
  const store = await getStore();
  return store.softDeleteNeed(id);
}

export async function restoreNeed(id: string): Promise<boolean> {
  const store = await getStore();
  return store.restoreNeed(id);
}

export async function listNeedsByOwner(ownerUserId: string, opts?: { includeDeleted?: boolean }): Promise<NeedRow[]> {
  const store = await getStore();
  return store.listNeedsByOwner(ownerUserId, opts);
}

export async function getVendorProfile(uid: string): Promise<VendorProfile | null> {
  const store = await getStore();
  return store.getVendorProfile(uid);
}

export async function upsertVendorProfile(uid: string, patch: Partial<VendorProfile>): Promise<VendorProfile> {
  const store = await getStore();
  return store.upsertVendorProfile(uid, patch);
}

export async function addSupport(needId: string, uid: string): Promise<number> {
  const store = await getStore();
  return store.addSupport(needId, uid);
}

export async function removeSupport(needId: string, uid: string): Promise<number> {
  const store = await getStore();
  return store.removeSupport(needId, uid);
}

export async function toggleFavorite(needId: string, uid: string, on: boolean): Promise<boolean> {
  const store = await getStore();
  return store.toggleFavorite(needId, uid, on);
}

export async function listFavorites(uid: string): Promise<NeedDetail[]> {
  const store = await getStore();
  return store.listFavorites(uid);
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
