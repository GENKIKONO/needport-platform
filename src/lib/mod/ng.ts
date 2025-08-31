type Match = { pattern:string; severity:'low'|'medium'|'high'; indices:{start:number;end:number}[]; excerpt?:string };
type Dict = { pattern:string; is_regex:boolean; severity:'low'|'medium'|'high' }[];

const normalize = (s:string) =>
  s.normalize('NFKC')
   .replace(/\s+/g,' ')
   .replace(/[‐-‒–—―]/g,'-'); // ハイフン類を統一（必要に応じて追加）

export function findNgMatches(input:string, dict:Dict): Match[] {
  const text = normalize(input || '');
  if (!text) return [];
  const out: Match[] = [];
  for (const d of dict) {
    const indices: {start:number;end:number}[] = [];
    if (d.is_regex) {
      let re:RegExp;
      try { re = new RegExp(d.pattern,'gi'); } catch { continue; }
      let m:RegExpExecArray|null;
      while ((m = re.exec(text))) {
        indices.push({ start:m.index, end:m.index + (m[0]?.length||0) });
        if (m.index === re.lastIndex) re.lastIndex++; // 無限ループ対策
      }
    } else {
      const needle = normalize(d.pattern);
      if (!needle) continue;
      let from = 0;
      for (;;) {
        const i = text.indexOf(needle, from);
        if (i === -1) break;
        indices.push({ start:i, end:i + needle.length });
        from = i + needle.length;
      }
    }
    if (indices.length) out.push({ pattern:d.pattern, severity:d.severity, indices });
  }
  return out;
}

// ハイライト用（重なりマージ→<mark>スパン）
export function highlightHtml(input:string, matches:Match[]): string {
  const text = input ?? '';
  if (!text) return '';
  const palette:Record<string,string> = {
    low:    'background-color:rgba(250,204,21,.35);',  // amber-300
    medium: 'background-color:rgba(248,113,113,.35);', // red-400
    high:   'background-color:rgba(239,68,68,.55);',   // red-500 stronger
  };
  // 正規化前後のズレを避けるため、ここでは素朴に input 上の同一文字数で扱うことを前提にする
  // （表記揺れ正規化でズレる場合は将来 diff-map を導入）
  const segs: {start:number;end:number;sev:string}[] = [];
  for (const m of matches) for (const r of m.indices) segs.push({ ...r, sev:m.severity });
  segs.sort((a,b)=> a.start-b.start || b.end-a.end);
  // 重なりマージ：優先は high > medium > low
  const pri = (s:string)=> s==='high'?3 : s==='medium'?2 : 1;
  const merged: typeof segs = [];
  for (const s of segs) {
    if (!merged.length) { merged.push(s); continue; }
    const last = merged[merged.length-1];
    if (s.start <= last.end) {
      // overlap → 拡張し、severityは強い方
      last.end = Math.max(last.end, s.end);
      last.sev = pri(s.sev) > pri(last.sev) ? s.sev : last.sev;
    } else {
      merged.push(s);
    }
  }
  // HTML組み立て
  let cur = 0, html = '';
  for (const s of merged) {
    html += escapeHtml(text.slice(cur, s.start));
    html += `<mark style="${palette[s.sev]} padding:0 .12em; border-radius:2px;">${escapeHtml(text.slice(s.start, s.end))}</mark>`;
    cur = s.end;
  }
  html += escapeHtml(text.slice(cur));
  return html;
}

function escapeHtml(s:string){return s.replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c] as string));}
