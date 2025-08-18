import { kv } from "@vercel/kv"; // 存在しない環境では undefined にならない設計（既存のフォールバック方針に合わせる）
import { randomUUID } from "crypto";
import type { ReferralToken, UserProfile, TrustScore, ReferralInvite } from "./types";

const HAS_KV = !!process.env.KV_REST_API_URL;

// キー設計
const K = {
  user: (id: string) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email.toLowerCase()}`,
  referral: (token: string) => `referral:${token}`,
  endorsementsUser: (id: string) => `endorse:user:${id}`,   // ZSET or LIST
  endorsementsNeed: (id: string) => `endorse:need:${id}`,   // ZSET or LIST
  events: `trust:events`,                                   // 最近イベント LIST
  invite: (token: string) => `ref:invite:${token}`,
  inviteByNeed: (needId: string) => `ref:need:${needId}`,
};

// --- メモリフォールバック ---
const mem = {
  users: new Map<string, UserProfile>(),
  emailIndex: new Map<string, string>(),
  referrals: new Map<string, ReferralToken>(),
  endorseU: new Map<string, number>(),   // userId -> count
  endorseN: new Map<string, number>(),   // needId -> count
  events: [] as any[],
  invites: new Map<string, ReferralInvite>(),
  inviteByNeed: new Map<string, string[]>(),
};

// Util
function now() { return new Date().toISOString(); }
function idUser() { return `u_${randomUUID().slice(0,8)}`; }
function idToken() { return randomUUID().replace(/-/g, ""); }

export async function getOrCreateUserByEmail(email: string, name?: string): Promise<UserProfile> {
  const key = K.userByEmail(email);
  if (HAS_KV) {
    const id = await kv.get<string>(key);
    if (id) return await kv.get<UserProfile>(K.user(id)) as UserProfile;
    const u: UserProfile = { id: idUser(), name, email, createdAt: now(), updatedAt: now(), stats: { endorsements:0, completedNeeds:0, disputes:0 } };
    await kv.set(K.user(u.id), u);
    await kv.set(key, u.id);
    return u;
  } else {
    const id = mem.emailIndex.get(email.toLowerCase());
    if (id) return mem.users.get(id)!;
    const u: UserProfile = { id: idUser(), name, email, createdAt: now(), updatedAt: now(), stats:{endorsements:0,completedNeeds:0,disputes:0} };
    mem.users.set(u.id, u); mem.emailIndex.set(email.toLowerCase(), u.id);
    return u;
  }
}

export async function getUser(id: string) {
  return HAS_KV ? await kv.get<UserProfile>(K.user(id)) : mem.users.get(id) || null;
}

export async function createReferralToken(referrerId: string, expiresInDays = 14): Promise<ReferralToken> {
  const tok = idToken();
  const rec: ReferralToken = { token: tok, referrerId, createdAt: now(),
    expiresAt: new Date(Date.now()+expiresInDays*864e5).toISOString() };
  if (HAS_KV) await kv.set(K.referral(tok), rec);
  else mem.referrals.set(tok, rec);
  return rec;
}

export async function acceptReferral(token: string, newUserId: string) {
  const load = HAS_KV ? await kv.get<ReferralToken>(K.referral(token)) : mem.referrals.get(token);
  if (!load) return { ok:false, reason:"invalid" as const };
  if (load.usedBy) return { ok:false, reason:"used" as const };
  if (load.expiresAt && Date.parse(load.expiresAt) < Date.now()) return { ok:false, reason:"expired" as const };

  // link user
  const user = await getUser(newUserId);
  if (!user) return { ok:false, reason:"nouser" as const };
  user.referrerId = load.referrerId; user.updatedAt = now();
  if (HAS_KV) { await kv.set(K.user(user.id), user); await kv.hset(K.user(user.id), user as any); }
  else { mem.users.set(user.id, user); }

  load.usedBy = newUserId;
  if (HAS_KV) await kv.set(K.referral(token), load); else mem.referrals.set(token, load);
  await pushEvent({ type:"referral_accept", userId:newUserId, referrerId:load.referrerId });
  return { ok:true as const, referrerId: load.referrerId };
}

export async function endorseUser(targetUserId: string, weight = 1) {
  if (HAS_KV) {
    const key = K.endorsementsUser(targetUserId);
    await kv.incrby(key, weight);
  } else {
    mem.endorseU.set(targetUserId, (mem.endorseU.get(targetUserId)||0)+weight);
  }
  const u = await getUser(targetUserId); if (u) { u.stats.endorsements += weight; u.updatedAt = now(); HAS_KV ? await kv.set(K.user(u.id), u) : mem.users.set(u.id, u); }
  await pushEvent({ type:"endorse_user", targetUserId });
}

async function countEndorseUser(targetUserId: string) {
  if (HAS_KV) { const val = await kv.get<number>(K.endorsementsUser(targetUserId)); return Number(val||0); }
  return mem.endorseU.get(targetUserId)||0;
}

// 事件ログ（最近100件）
async function pushEvent(e: any) {
  if (HAS_KV) await kv.lpush(K.events, JSON.stringify({ ...e, at: now() })), await kv.ltrim(K.events,0,99);
  else { mem.events.unshift({ ...e, at: now() }); mem.events = mem.events.slice(0,100); }
}
export async function recentTrustEvents(limit=20) {
  if (HAS_KV) { const arr = await kv.lrange(K.events,0,limit-1); return arr.map(x=>JSON.parse(String(x))); }
  return mem.events.slice(0,limit);
}

// 簡易スコア: 紹介 +20 / 推薦×5 / 完了×3 / 紛争×-20（0-100にクリップ）
export async function computeTrust(userId: string): Promise<TrustScore> {
  const u = await getUser(userId); if (!u) return { value:0, bands:"low", breakdown:{} };
  const ref = u.referrerId ? 20 : 0;
  const endo = (await countEndorseUser(userId)) * 5;
  const comp = (u.stats.completedNeeds||0)*3;
  const pen = -(u.stats.disputes||0)*20;
  const raw = Math.max(0, Math.min(100, ref+endo+comp+pen));
  return { value: raw, bands: raw>=70 ? "high" : raw>=35 ? "mid" : "low", breakdown:{ref,endorse:endo,completed:comp,penalty:pen} };
}

// 擬似実装例：実ストレージのキー/構造に合わせて取得し、{ rows, total } を返す
export async function listUsersWithTrust({ page = 1, pageSize = 200 } = {}) {
  if (HAS_KV) {
    // KVから全ユーザを取得
    const allUsers: UserProfile[] = [];
    const pattern = "user:*";
    const keys = await kv.scan(0, { match: pattern, count: 1000 });
    
    for (const key of keys) {
      if (key.startsWith("user:") && !key.includes(":email:")) {
        const userId = key.replace("user:", "");
        const user = await kv.get<UserProfile>(key);
        if (user) {
          const score = await computeTrust(userId);
          allUsers.push({ ...user, trust: score });
        }
      }
    }
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const rows = allUsers.slice(start, end);
    
    return { rows, total: allUsers.length };
  } else {
    // メモリから全ユーザを取得
    const allUsers: (UserProfile & { trust: TrustScore })[] = [];
    
    for (const [userId, user] of mem.users) {
      const score = await computeTrust(userId);
      allUsers.push({ ...user, trust: score });
    }
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const rows = allUsers.slice(start, end);
    
    return { rows, total: allUsers.length };
  }
}

// 紹介リンク履歴の保存・取得
export async function saveReferralInvite(inv: ReferralInvite) {
  if (HAS_KV) {
    await kv.set(K.invite(inv.token), inv);
    if (inv.needId) {
      await kv.zadd(K.inviteByNeed(inv.needId), { score: Date.parse(inv.createdAt), member: inv.token });
    }
  } else {
    mem.invites.set(inv.token, inv);
    if (inv.needId) {
      const arr = mem.inviteByNeed.get(inv.needId) ?? [];
      arr.push(inv.token);
      mem.inviteByNeed.set(inv.needId, arr);
    }
  }
}

export async function listReferralInvitesByNeed(needId: string, limit = 5): Promise<ReferralInvite[]> {
  if (HAS_KV) {
    const tokens = await kv.zrange(K.inviteByNeed(needId), -limit, -1);
    const items = await Promise.all(tokens.reverse().map(t => kv.get<ReferralInvite>(K.invite(t))));
    return items.filter(Boolean) as ReferralInvite[];
  } else {
    const arr = mem.inviteByNeed.get(needId) ?? [];
    return arr.slice(-limit).reverse().map(t => mem.invites.get(t)!).filter(Boolean);
  }
}
