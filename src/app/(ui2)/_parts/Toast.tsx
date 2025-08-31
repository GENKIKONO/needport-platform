"use client";
import { useEffect, useState } from "react";
export function useToast(){
  const [msg,setMsg] = useState<string|null>(null);
  const [tone,setTone] = useState<'ok'|'err'>('ok');
  const show = (m:string, t:'ok'|'err'='ok')=>{ setTone(t); setMsg(m); };
  const hide = ()=> setMsg(null);
  const node = msg ? (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className={`px-4 py-2 rounded shadow text-sm text-white ${tone==='ok'?'bg-slate-900':'bg-red-600'}`}>
        {msg}
      </div>
    </div>
  ) : null;
  return { show, hide, node };
}
