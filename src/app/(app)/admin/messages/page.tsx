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
            <DecisionPanel messageId={m.id}/>
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

function DecisionPanel({ messageId }:{ messageId:string }) {
  const React = require('react');
  const useSWR = require('swr').default;
  const fetcher = (u:string)=> fetch(u).then((r)=>r.json());
  const { data } = useSWR('/api/admin/approval-templates', fetcher);
  const [templateId,setTemplateId] = React.useState('');
  const [reason,setReason] = React.useState('');
  const [busy,setBusy] = React.useState(false);
  const templates = (data?.rows || []).filter((t:any)=> t.kind==='message' && t.enabled);

  const applyTpl = ()=>{
    const t = templates.find((x:any)=> x.id===templateId);
    if(t) setReason(t.body);
  };
  const approve = async ()=>{
    setBusy(true);
    await fetch('/api/admin/messages/approve', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ messageId, templateId: templateId || undefined, reasonText: reason || undefined }) });
    setBusy(false); location.reload();
  };
  const reject = async ()=>{
    if(!reason) { alert('却下理由を入力してください'); return; }
    setBusy(true);
    await fetch('/api/admin/messages/reject', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ messageId, templateId: templateId || undefined, reasonText: reason }) });
    setBusy(false); location.reload();
  };
  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 items-center">
        <select className="border rounded px-2 py-1" value={templateId} onChange={(e)=>setTemplateId(e.target.value)}>
          <option value="">テンプレを選択</option>
          {templates.map((t:any)=>(<option key={t.id} value={t.id}>{t.title}</option>))}
        </select>
        <button className="px-2 py-1 rounded bg-gray-200" onClick={applyTpl}>本文に挿入</button>
      </div>
      <textarea className="w-full border rounded p-2 min-h-[80px]" placeholder="審査の理由（申請者に通知されます）" value={reason} onChange={(e)=>setReason(e.target.value)} />
      <div className="flex gap-2">
        <button disabled={busy} className="px-3 py-1 rounded bg-emerald-600 text-white" onClick={approve}>承認（公開）</button>
        <button disabled={busy} className="px-3 py-1 rounded bg-rose-600 text-white" onClick={reject}>却下</button>
      </div>
    </div>
  );
}
