"use client";
import { useState } from "react";
import { Modal } from "../_parts/Modal";
import { useToast } from "../_parts/Toast";

export default function QuickProposal({need}:{need:any}){
  const [open,setOpen] = useState(false);
  const [title,setTitle] = useState("");
  const [body,setBody] = useState("");
  const [price,setPrice] = useState<string>("");

  const toast = useToast();

  const submit = async ()=>{
    try {
      const res = await fetch("/api/proposals/create", {
        method: "POST",
        headers: {"content-type":"application/json"},
        body: JSON.stringify({
          needId: need.id,
          title: title || `【${need.title||'提案'}】のご提案`,
          body,
          estimatePrice: price ? Number(price) : undefined
        })
      });
      if(!res.ok){
        const j = await res.json().catch(()=>({}));
        throw new Error(j?.error || "送信に失敗しました");
      }
      toast.show("提案を送信しました。承認後に相手へ表示されます。");
      setOpen(false); setTitle(""); setBody(""); setPrice("");
    } catch(e:any){
      toast.show(e.message || "エラーが発生しました", "err");
    }
  };

  return (
    <>
      <button className="px-3 py-2 rounded bg-slate-900 text-white text-sm" onClick={()=>setOpen(true)}>
        かんたん提案
      </button>
      <Modal open={open} onClose={()=>setOpen(false)} title="かんたん提案">
        <div className="grid gap-3">
          <input className="border rounded px-3 py-2 text-sm" placeholder="件名（任意）" value={title} onChange={e=>setTitle(e.target.value)} />
          <textarea className="border rounded px-3 py-2 text-sm min-h-[120px]" placeholder="提案内容" value={body} onChange={e=>setBody(e.target.value)} />
          <div className="flex items-center gap-2">
            <input className="border rounded px-3 py-2 text-sm w-40" placeholder="概算金額（任意）" inputMode="numeric" value={price} onChange={e=>setPrice(e.target.value)} />
            <span className="text-xs text-slate-500">円</span>
          </div>
          <div className="flex justify-end gap-2">
            <button className="px-3 py-2 rounded border text-sm" onClick={()=>setOpen(false)}>閉じる</button>
            <button className="px-3 py-2 rounded bg-sky-600 text-white text-sm" onClick={submit}>送信</button>
          </div>
        </div>
        {toast.node}
      </Modal>
    </>
  );
}
