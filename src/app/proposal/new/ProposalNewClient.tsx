'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

// ここに元 page.tsx のクライアントロジックを移植します。
// ※ フォーム入力、useSearchParams、submit 処理 等

export default function ProposalNewClient() {
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  // 既存の初期値取得
  const prefillNeedId = sp.get('need') ?? '';

  // 既存のフォーム状態
  const [body, setBody] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  // 既存の submit 実装
  const submit = async () => {
    const res = await fetch('/api/proposals', { 
      method:'POST', 
      headers:{'Content-Type':'application/json'}, 
      body: JSON.stringify({ needId: prefillNeedId, body })
    });
    const j = await res.json();
    setMsg(j.ok ? '提案を受け付けました（ドラフト）' : '送信に失敗しました');
  };

  return (
    <main className="p-6 max-w-xl space-y-4">
      <h1 className="text-lg font-bold">提案を送る</h1>
      <p className="text-sm text-gray-600">対象ニーズ: {prefillNeedId || '(指定なし)'}</p>
      <textarea 
        className="w-full h-40 border rounded p-2" 
        value={body} 
        onChange={e=>setBody(e.target.value)} 
        placeholder="提案内容（50文字以上）" 
      />
      <button 
        onClick={submit} 
        disabled={pending}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
      >
        {pending ? '送信中…' : '送信'}
      </button>
      {msg && <p className="text-sm">{msg}</p>}
    </main>
  );
}
