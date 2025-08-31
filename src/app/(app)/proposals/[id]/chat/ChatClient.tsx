'use client';

import React from 'react';
import useSWR from 'swr';

type Row = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_by?: string[];
};

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
});

export default function ChatClient({ proposalId }: { proposalId: string }) {
  const [text, setText] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const { data, mutate, isLoading } = useSWR<{rows: Row[]}>(`/api/messages/list?proposalId=${proposalId}&limit=50`, fetcher, {
    refreshInterval: 4000, // 軽ポーリング（後でSSEに差し替え可）
    revalidateOnFocus: true,
  });

  const rows = data?.rows ?? [];

  // 最下部オートスクロール
  const endRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [rows.length]);

  // 既読更新：描画後に一括送信（最小実装）
  React.useEffect(() => {
    const ids = rows?.map(r => r.id) ?? [];
    if (!ids.length) return;
    fetch('/api/messages/read', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ proposalId, messageIds: ids.slice(-10) }) // 直近10件だけ既読化で十分
    }).catch(()=>{});
  }, [rows, proposalId]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setErr(null);
    const optimistic: Row = {
      id: `tmp-${Date.now()}`,
      sender_id: 'me',
      body: text,
      created_at: new Date().toISOString(),
      read_by: []
    };
    // 楽観追加
    mutate({ rows: [...rows, optimistic] }, { revalidate: false });
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ proposalId, body: text })
      });
      if (!res.ok) {
        const j = await res.json().catch(()=>({}));
        throw new Error(j?.error || `send_failed_${res.status}`);
      }
      setText('');
      // 再フェッチ
      mutate();
    } catch (e:any) {
      setErr(e.message || '送信に失敗しました');
      // 失敗した楽観を除外
      mutate();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="p-3 border-b bg-muted/30 text-sm">
        {isLoading ? '読み込み中…' : `メッセージ ${rows.length} 件`}
      </div>

      <div className="p-3 space-y-3 max-h-[55vh] overflow-y-auto">
        {rows.map(m => (
          <div key={m.id} className={`flex ${m.sender_id==='me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-lg px-3 py-2 text-sm shadow ${m.sender_id==='me' ? 'bg-sky-600 text-white' : 'bg-gray-100'}`}>
              <div className="whitespace-pre-wrap break-words">{m.body}</div>
              <div className={`mt-1 text-[10px] opacity-70 ${m.sender_id==='me' ? 'text-white' : 'text-gray-500'}`}>
                {new Date(m.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
        {!rows.length && (
          <div className="text-sm text-gray-500">まだメッセージはありません。右下のボックスから送信できます。</div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={onSend} className="p-3 border-t grid grid-cols-[1fr_auto] gap-2">
        <textarea
          value={text}
          onChange={e=>setText(e.target.value)}
          placeholder="メッセージを入力…"
          rows={2}
          className="w-full resize-none rounded-md border p-2 text-sm"
        />
        <button
          disabled={sending || !text.trim()}
          className="px-3 py-2 rounded-md bg-sky-600 text-white text-sm disabled:opacity-50"
        >
          送信
        </button>
        {err && <div className="col-span-2 text-xs text-red-600">{err}</div>}
      </form>
    </div>
  );
}
