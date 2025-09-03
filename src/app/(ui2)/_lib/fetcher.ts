export async function fetchJson(input: RequestInfo, init?: RequestInit, timeoutMs=8000){
  const ctrl = new AbortController();
  const t = setTimeout(()=>ctrl.abort(), timeoutMs);
  let err: any;
  for(const wait of [0, 200, 500, 1000]) {
    if(wait) await new Promise(r=>setTimeout(r, wait));
    try{
      const res = await fetch(input, { ...init, signal: ctrl.signal });
      if(res.ok) { clearTimeout(t); return res.json(); }
      if(res.status>=500) continue; // 再試行
      clearTimeout(t); throw new Error(`HTTP ${res.status}`);
    }catch(e){ err = e; }
  }
  throw err ?? new Error("fetch failed");
}
