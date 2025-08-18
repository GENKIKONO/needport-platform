import type { FeatureFlags } from "./types";

const DEFAULT_FLAGS: FeatureFlags = {
  userEditEnabled: true,
  userDeleteEnabled: true,
  vendorEditEnabled: true,
  demoGuardEnabled: false,
  showSamples: false,
};

async function getImpl() {
  try {
    const { kv } = await import("@vercel/kv");
    return { kv, type: "kv" as const };
  } catch {
    return { kv: null, type: "memory" as const };
  }
}

export async function getFlags(): Promise<FeatureFlags> {
  const impl = await getImpl();
  
  if (impl.type === "kv") {
    try {
      const stored = await impl.kv.get<string>("flags");
      if (stored) {
        return { ...DEFAULT_FLAGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Failed to get flags from KV:", error);
    }
  }
  
  // Memory fallback or default
  return { ...DEFAULT_FLAGS };
}

export async function setFlags(patch: Partial<FeatureFlags>): Promise<FeatureFlags> {
  const impl = await getImpl();
  const current = await getFlags();
  const updated = { ...current, ...patch };
  
  if (impl.type === "kv") {
    try {
      await impl.kv.set("flags", JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to set flags in KV:", error);
    }
  }
  
  return updated;
}
