'use client';
import { useEffect, useRef, useState } from 'react';

export default function RoomClient({roomId}:{roomId:string}){
  const [msgs,setMsgs]=useState<any[]>([]);
  const [text,setText]=useState('');
  const bottomRef=useRef<HTMLDivElement>(null);

  async function load(){ const r=await fetch(`/api/rooms/${roomId}/messages`,{cache:'no-store'}); setMsgs(r.ok?await r.json():[]); }
  useEffect(()=>{ load(); const t=setInterval(load, 2500); return ()=>clearInterval(t); },[roomId]);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}); },[msgs]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Chat */}
      <div className="lg:col-span-2 np-card p-4 flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto space-y-2">
          {msgs.map((m:any)=>(
            <div key={m.id} className="text-sm"><span className="font-medium">{m.user_ref}</span>：{m.body}</div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={async(e)=>{ e.preventDefault(); if(!text.trim())return;
          await fetch(`/api/rooms/${roomId}/messages`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})});
          setText(''); load();
        }} className="mt-3 flex gap-2">
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="メッセージ…" className="input input-bordered flex-1" />
          <button className="btn btn-primary">送信</button>
        </form>
      </div>

      {/* Milestones */}
      <Milestones roomId={roomId}/>
    </div>
  );
}

function Milestones({roomId}:{roomId:string}){
  const [items,setItems]=useState<any[]>([]);
  const [title,setTitle]=useState(''); const [amount,setAmount]=useState<number|''>(''); const [due,setDue]=useState('');

  async function load(){ const r=await fetch(`/api/milestones/${roomId}`,{cache:'no-store'}); setItems(r.ok?await r.json():[]); }
  useEffect(()=>{ load(); },[roomId]);

  return (
    <div className="np-card p-4">
      <div className="font-semibold mb-2">マイルストーン</div>
      <ul className="space-y-2 mb-3">
        {items.map((m:any)=>(
          <li key={m.id} className="text-sm flex justify-between">
            <span>{m.title} {m.due_date?`（期日 ${m.due_date}）`:''}</span>
            <span className="text-neutral-600">{m.amount_yen?`¥${m.amount_yen.toLocaleString()}`:''}</span>
          </li>
        ))}
        {!items.length && <li className="text-sm text-neutral-500">未登録</li>}
      </ul>
      <form onSubmit={async(e)=>{e.preventDefault();
        await fetch(`/api/milestones/${roomId}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title, due_date:due||null, amount_yen:amount||null})});
        setTitle(''); setAmount(''); setDue(''); load();
      }} className="space-y-2">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="項目名" className="input input-bordered w-full" />
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={due} onChange={e=>setDue(e.target.value)} className="input input-bordered" />
          <input type="number" value={amount as any} onChange={e=>setAmount(Number(e.target.value)||'')} placeholder="金額(円)" className="input input-bordered" />
        </div>
        <button className="btn btn-ghost w-full">マイルストーンを追加</button>
      </form>
    </div>
  );
}
