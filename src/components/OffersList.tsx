'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OffersList({ needId }:{needId:string}) {
  const [items,setItems]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{(async()=>{
    setLoading(true);
    const r = await fetch(`/api/offers?need_id=${needId}`,{cache:'no-store'});
    setItems(r.ok ? await r.json() : []); 
    setLoading(false);
  })()},[needId]);

  if(loading) return <div className="mt-4 text-sm text-neutral-500">読み込み中…</div>;
  if(!items.length) return <div className="mt-4 text-sm text-neutral-500">まだ提案はありません。</div>;

  return (
    <div className="mt-4 space-y-3">
      {items.map(o=>(
        <div key={o.id} className="np-card p-4 flex items-center justify-between">
          <div>
            <div className="font-medium">{o.provider_handle}</div>
            {o.price_yen ? <div className="text-sm text-neutral-600">¥{o.price_yen.toLocaleString()}</div> : null}
            {o.memo ? <div className="text-sm text-neutral-600">{o.memo}</div> : null}
          </div>
          <div className="flex items-center gap-2">
            {o.status==='pending' ? (
              <button className="btn btn-primary"
                onClick={async()=>{
                  const r=await fetch(`/api/offers/${o.id}/accept`,{method:'POST'});
                  if(r.ok){ const {room_id}=await r.json(); location.href=`/rooms/${room_id}`; }
                }}>承認してルーム作成</button>
            ) : <Link className="btn btn-ghost" href={`/rooms/${o.room_id || ''}`}>ルームへ</Link>}
          </div>
        </div>
      ))}
    </div>
  );
}
