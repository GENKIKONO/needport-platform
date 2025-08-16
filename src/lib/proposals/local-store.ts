import type { ProposalDraft } from '../types/b2b';

const KEY = 'demo:proposals:v1';
type Store = Record<string, ProposalDraft[]>; // needId -> drafts

let mem: Store | null = null;

const load = (): Store => {
  if (mem) return mem;
  if (typeof window === 'undefined') return {};
  const raw = window.localStorage.getItem(KEY);
  mem = raw ? JSON.parse(raw) as Store : {};
  return mem!;
};

const save = (s: Store) => {
  mem = s;
  if (typeof window !== 'undefined') window.localStorage.setItem(KEY, JSON.stringify(s));
};

export const listByNeed = (needId: string): ProposalDraft[] => (load()[needId] ?? []);

export const upsert = (p: ProposalDraft) => {
  const s = load();
  const arr = s[p.needId] ?? [];
  const i = arr.findIndex(x => x.id === p.id);
  if (i >= 0) arr[i] = p;
  else arr.push(p);
  s[p.needId] = arr;
  save(s);
};

export const remove = (needId: string, id: string) => {
  const s = load();
  s[needId] = (s[needId] ?? []).filter(x => x.id !== id);
  save(s);
};

export const replaceAll = (needId: string, arr: ProposalDraft[]) => {
  const s = load();
  s[needId] = arr;
  save(s);
};
