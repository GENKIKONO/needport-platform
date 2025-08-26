'use client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function ProposalNew(){
  const p = useSearchParams();
  const need = p.get('need') ?? '';
  const [body,setBody] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async () => {
    const res = await fetch('/api/proposals', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ needId: need, body })});
    const j = await res.json();
    setMsg(j.ok ? '提案を受け付けました（ドラフト）' : '送信に失敗しました');
  };

  return (
    <main className="p-6 max-w-xl space-y-4">
      <h1 className="text-lg font-bold">提案を送る</h1>
      <p className="text-sm text-gray-600">対象ニーズ: {need || '(指定なし)'}</p>
      <textarea className="w-full h-40 border rounded p-2" value={body} onChange={e=>setBody(e.target.value)} placeholder="提案内容（50文字以上）" />
      <button onClick={submit} className="px-4 py-2 rounded bg-black text-white">送信</button>
      {msg && <p className="text-sm">{msg}</p>}
    </main>
  );
}
