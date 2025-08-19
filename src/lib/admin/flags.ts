export type FeatureFlags = {
  userEditEnabled: boolean;
  userDeleteEnabled: boolean;
  demoGuardEnabled: boolean;
  sampleVisible: boolean;
  vendorEditEnabled?: boolean;
  marketingHeroEnabled?: boolean;
  marketingBottomHeroEnabled?: boolean;
  requireAccountForEngagement?: boolean;
  twoPanePublicEnabled?: boolean; // PCで左ナビ常時表示レイアウト
};

export const DEFAULT_FLAGS: FeatureFlags = {
  userEditEnabled: true,
  userDeleteEnabled: true,
  demoGuardEnabled: false,
  sampleVisible: false, // サンプルは非公開がデフォルト
  vendorEditEnabled: true,
  marketingHeroEnabled: true, // ヒーロー表示は常時ON
  marketingBottomHeroEnabled: true, // 下部ヒーローも常時ON
  requireAccountForEngagement: true, // 未ログイン操作は制限
  twoPanePublicEnabled: true, // PCで2ペインレイアウトを有効
};

const KV_KEY = "flags:global";

// KV優先・メモリフォールバック
let memoryFlags: FeatureFlags | null = null;

async function readKV(): Promise<FeatureFlags | null> {
  try {
    // KV導入済みなら使う（未導入なら catch）
    // @ts-ignore
    const { kv } = await import("@vercel/kv");
    const v = await kv.get<FeatureFlags>(KV_KEY);
    return v ?? null;
  } catch { return null; }
}

async function writeKV(v: FeatureFlags) {
  try {
    // @ts-ignore
    const { kv } = await import("@vercel/kv");
    await kv.set(KV_KEY, v);
  } catch {}
}

export async function getFlags(): Promise<FeatureFlags> {
  const kv = await readKV();
  if (kv) { memoryFlags = kv; return kv; }
  if (memoryFlags) return memoryFlags;
  memoryFlags = DEFAULT_FLAGS;
  return memoryFlags;
}

export async function setFlags(patch: Partial<FeatureFlags>): Promise<FeatureFlags> {
  const current = await getFlags();
  const next: FeatureFlags = { ...current, ...patch };
  memoryFlags = next;
  await writeKV(next);
  return next;
}
