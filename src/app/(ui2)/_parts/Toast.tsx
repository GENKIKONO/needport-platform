"use client";
import { useEffect, useState } from "react";

export function useToast(){
  const [msg,setMsg] = useState<string|null>(null);
  const [tone,setTone] = useState<'ok'|'error'>('ok');
  
  const toast = (m:string, t:'ok'|'error'='ok')=>{ setTone(t); setMsg(m); };
  const hide = ()=> setMsg(null);
  
  const Toaster = () => msg ? (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className={`px-4 py-2 rounded shadow text-sm text-white ${tone==='ok'?'bg-slate-900':'bg-red-600'}`}>
        {msg}
      </div>
    </div>
  ) : <div style={{display: 'none'}} />;
  
  return { toast, hide, Toaster };
}

export default function Toast() {
  return <div />; // Valid React element
}
