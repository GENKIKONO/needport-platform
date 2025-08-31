import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

async function fetchPending() {
  const res = await fetch(`${process.env.PLATFORM_ORIGIN}/api/messages/list?status=pending`, { cache: 'no-store', headers: { 'x-needport-internal': '1' }});
  // ↑ もし list API に status フィルタが無い場合は専用APIを作るか、ここで /api/admin/messages/pending を叩く実装に修正
  return res.ok ? res.json() : { rows: [] };
}

export default async function AdminMessagesPage() {
  const { userId } = auth();
  if (!userId) return <div className="p-6">ログインが必要です。</div>;

  // 権限チェックはAPI側で厳密に
  const { rows = [] } = await fetchPending();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">メッセージ承認キュー</h1>
      <p className="text-sm text-muted-foreground">保留（pending）中のメッセージを承認/却下します。</p>
      <div className="space-y-3">
        {rows.length === 0 && <div className="text-sm text-muted-foreground">保留中はありません。</div>}
        {rows.map((m: any) => (
          <div key={m.id} className="border rounded p-3">
            <div className="text-xs text-muted-foreground">proposal: {m.proposal_id} / sender: {m.sender_id}</div>
            <Highlighted text={m.body}/>
            <form action="/api/admin/messages/moderate" method="post" className="flex gap-2">
              <input type="hidden" name="messageId" value={m.id} />
              <button name="action" value="approve" className="px-3 py-1 rounded bg-green-600 text-white">承認</button>
              <button name="action" value="reject" className="px-3 py-1 rounded bg-rose-600 text-white">却下</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

function Highlighted({ text }:{ text:string }) {
  const [html,setHtml] = require('react').useState('');
  require('react').useEffect(()=>{
    (async ()=>{
      const r = await fetch('/api/admin/ng-words/preview', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ text }) });
      const j = await r.json(); setHtml(j.html||'');
    })();
  },[text]);
  return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }}/>;
}
