import { currentUser } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

async function fetchQueue() {
  try {
    const res = await fetch(`${process.env.PLATFORM_ORIGIN}/api/needs/list?status=review&per=50`, { cache: 'no-store' });
    if (!res.ok) return { rows: [], total: 0 };
    return res.json();
  } catch { return { rows: [], total: 0 }; }
}

export default async function AdminNeedsQueue() {
  const user = await currentUser();
  if (!user) return <div className="p-6">ログインが必要です。</div>;

  // 画面側でも最低限の「admin風」表示（本当の権限はAPIで判定）
  const queue = await fetchQueue();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">承認キュー（review）</h1>
      <p className="text-sm text-muted-foreground mb-2">該当件数: {queue.total}</p>
      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">タイトル</th>
              <th className="px-3 py-2">地域</th>
              <th className="px-3 py-2">カテゴリ</th>
              <th className="px-3 py-2">状態</th>
              <th className="px-3 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {queue.rows?.map((n: any) => (
              <tr key={n.id} className="border-t">
                <td className="px-3 py-2">
                  <div>{n.title}</div>
                  <Highlighted text={n.summary}/>
                  <DecisionPanel needId={n.id}/>
                </td>
                <td className="px-3 py-2 text-center">{n.region}</td>
                <td className="px-3 py-2 text-center">{n.category}</td>
                <td className="px-3 py-2 text-center">{n.status}</td>
                <td className="px-3 py-2">
                  <form action="/api/needs/publish" method="post" className="inline">
                    <input type="hidden" name="id" value={n.id} />
                    <button className="px-3 py-1.5 rounded bg-emerald-600 text-white">公開にする</button>
                  </form>
                  <form action="/api/needs/review" method="post" className="inline ml-2">
                    <input type="hidden" name="id" value={n.id} />
                    <input type="hidden" name="status" value="draft" />
                    <button className="px-3 py-1.5 rounded bg-amber-600 text-white">下書きへ戻す</button>
                  </form>
                </td>
              </tr>
            ))}
            {!queue.rows?.length && (
              <tr><td className="px-3 py-6 text-center text-gray-500" colSpan={5}>承認待ちのニーズはありません。</td></tr>
            )}
          </tbody>
        </table>
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

// 承認操作パネル（テンプレ＋理由＋承認/却下）
function DecisionPanel({ needId }:{ needId:string }) {
  const React = require('react');
  const useSWR = require('swr').default;
  const fetcher = (u:string)=> fetch(u).then((r)=>r.json());
  const { data } = useSWR('/api/admin/approval-templates', fetcher);
  const [templateId,setTemplateId] = React.useState('');
  const [reason,setReason] = React.useState('');
  const [busy,setBusy] = React.useState(false);
  const templates = (data?.rows || []).filter((t:any)=> t.kind==='need' && t.enabled);

  const applyTpl = ()=>{
    const t = templates.find((x:any)=> x.id===templateId);
    if(t) setReason(t.body);
  };
  const approve = async ()=>{
    setBusy(true);
    await fetch('/api/admin/needs/approve', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ needId, templateId: templateId || undefined, reasonText: reason || undefined }) });
    setBusy(false); location.reload();
  };
  const reject = async ()=>{
    if(!reason) { alert('却下理由を入力してください'); return; }
    setBusy(true);
    await fetch('/api/admin/needs/reject', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ needId, templateId: templateId || undefined, reasonText: reason }) });
    setBusy(false); location.reload();
  };
  return (
    <div className="mt-3 border rounded p-3 space-y-2">
      <div className="text-sm font-medium">審査</div>
      <div className="flex flex-wrap gap-2 items-center">
        <select className="border rounded px-2 py-1" value={templateId} onChange={(e)=>setTemplateId(e.target.value)}>
          <option value="">テンプレを選択</option>
          {templates.map((t:any)=>(<option key={t.id} value={t.id}>{t.title}</option>))}
        </select>
        <button className="px-2 py-1 rounded bg-gray-200" onClick={applyTpl}>本文に挿入</button>
      </div>
      <textarea className="w-full border rounded p-2 min-h-[100px]" placeholder="審査の理由（申請者に通知されます）" value={reason} onChange={(e)=>setReason(e.target.value)} />
      <div className="flex gap-2">
        <button disabled={busy} className="px-3 py-1 rounded bg-emerald-600 text-white" onClick={approve}>承認して公開</button>
        <button disabled={busy} className="px-3 py-1 rounded bg-rose-600 text-white" onClick={reject}>却下（差し戻し）</button>
      </div>
    </div>
  );
}
