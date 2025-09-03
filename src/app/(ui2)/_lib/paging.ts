export type PageParams = { page?: number; size?: number; q?: string; area?: string; cat?: string; };
export function normalize({page=1,size=20,q="",area="",cat=""}:PageParams){
  const s = Math.max(1, Math.min(size, 50));
  const p = Math.max(1, Math.min(page, 250)); // 5k件まで
  return { page:p, size:s, q:q.slice(0,120), area:area.slice(0,80), cat:cat.slice(0,80) };
}
