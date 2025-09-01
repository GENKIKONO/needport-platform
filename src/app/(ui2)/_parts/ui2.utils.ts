export function cn(...xs:(string|false|undefined|null)[]){ return xs.filter(Boolean).join(' '); }

export function isActivePath(pathname:string, href:string){
  if (!pathname || !href) return false;
  if (href === '/v2') return pathname === '/v2';
  return pathname.startsWith(href);
}

export const fmt = {
  number:(n?:number)=> typeof n === 'number' && isFinite(n) ? n.toLocaleString() : '—'
};
