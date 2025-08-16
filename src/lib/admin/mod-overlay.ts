// UI層だけで使う"上書きレジストリ"。本番DBには触れない。
export type ModStatus = 'demo' | 'pending' | 'approved' | 'rejected' | 'archived';

type Store = {
  status: Record<string, ModStatus>;
  category: Record<string, string | undefined>;
  comments: Record<string, { id: string; author: string; body: string; at: string }[]>;
};

const KEY = 'admin:mod-overlay:v1';
let mem: Store | null = null;

function load(): Store {
  if (mem) return mem;
  if (typeof window === 'undefined') return { status: {}, category: {}, comments: {} };
  const raw = window.localStorage.getItem(KEY);
  mem = raw ? JSON.parse(raw) as Store : { status: {}, category: {}, comments: {} };
  return mem!;
}

function save(s: Store) {
  mem = s;
  if (typeof window !== 'undefined') window.localStorage.setItem(KEY, JSON.stringify(s));
}

// getters
export const getStatus = (id: string): ModStatus | undefined => load().status[id];
export const getCategory = (id: string): string | undefined => load().category[id];
export const getComments = (id: string) => load().comments[id] ?? [];

// setters
export function setStatus(id: string, st: ModStatus) {
  const s = load();
  s.status[id] = st;
  save(s);
}

export function setCategory(id: string, cat?: string) {
  const s = load();
  s.category[id] = cat;
  save(s);
}

export function addComment(id: string, c: { author: string; body: string }) {
  const s = load();
  (s.comments[id] ||= []).push({
    id: crypto.randomUUID?.() ?? String(Date.now()),
    author: c.author,
    body: c.body,
    at: new Date().toISOString()
  });
  save(s);
}

export function deleteComment(id: string, cid: string) {
  const s = load();
  s.comments[id] = (s.comments[id] || []).filter(x => x.id !== cid);
  save(s);
}

// 公開可否（UI専用判定）
export function isPubliclyVisible(id: string, fallback: ModStatus = 'approved'): boolean {
  const req = process.env.NEXT_PUBLIC_REQUIRE_APPROVAL === '1';
  const st = getStatus(id) ?? fallback;
  return req ? st === 'approved' || st === 'demo' : st !== 'archived' && st !== 'rejected';
}
