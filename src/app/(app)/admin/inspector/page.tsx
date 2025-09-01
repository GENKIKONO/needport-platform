"use client";
import { useState } from "react";

async function jget(url:string){ const r = await fetch(url); if(!r.ok) throw new Error(await r.text()); return r.json(); }
async function jpost(url:string, body:any){ const r = await fetch(url,{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) }); if(!r.ok) throw new Error(await r.text()); return r.json(); }

export default function InspectorPage(){
  const [proposalId, setPid] = useState("");
  const [messageId, setMid] = useState("");
  const [needId, setNid] = useState("");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  const uid = ""; // 必要なら middleware で埋め込む or サーバ側で取得

  const lookup = async (kind:"proposal"|"message"|"need")=>{
    try{
      setLoading(true); setErr("");
      const q = kind==="proposal" ? `proposalId=${encodeURIComponent(proposalId)}`
              : kind==="message" ? `messageId=${encodeURIComponent(messageId)}`
              : `needId=${encodeURIComponent(needId)}`;
      const res = await jget(`/api/admin/inspector/lookup?${q}&uid=${uid}`);
      setData(res);
    }catch(e:any){ setErr(e?.message||"failed"); } finally{ setLoading(false); }
  };

  const approveVisible = async (ids:string[])=>{
    if(!ids.length) return;
    if(!confirm(`選択した ${ids.length} 件を承認（visible=true）します。実行しますか？`)) return;
    await jpost("/api/admin/inspector/fix", { action:"approve_messages", messageIds: ids, confirm:true, uid });
    alert("承認しました");
    if (data?.proposal?.id) lookup("proposal");
  };

  const lockProposal = async (lock:boolean)=>{
    if(!data?.proposal?.id) return;
    const action = lock ? "lock_proposal" : "unlock_proposal";
    if(!confirm(lock ? "この提案をロックして新規メッセージを停止します。実行しますか？"
                     : "この提案のロックを解除しますか？")) return;
    await jpost("/api/admin/inspector/fix", { action, proposalId: data.proposal.id, confirm:true, uid });
    alert(lock ? "ロックしました" : "解除しました");
    lookup("proposal");
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-semibold">Admin Thread Inspector</h1>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="border rounded p-3 bg-white">
          <div className="text-sm font-medium mb-1">Proposal Lookup</div>
          <input className="w-full border rounded px-2 py-1 text-sm" placeholder="proposalId" value={proposalId} onChange={e=>setPid(e.target.value)} />
          <button onClick={()=>lookup("proposal")} className="mt-2 px-3 py-1.5 text-sm rounded bg-slate-900 text-white">検索</button>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-sm font-medium mb-1">Message Lookup</div>
          <input className="w-full border rounded px-2 py-1 text-sm" placeholder="messageId" value={messageId} onChange={e=>setMid(e.target.value)} />
          <button onClick={()=>lookup("message")} className="mt-2 px-3 py-1.5 text-sm rounded bg-slate-900 text-white">検索</button>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-sm font-medium mb-1">Need Lookup</div>
          <input className="w-full border rounded px-2 py-1 text-sm" placeholder="needId" value={needId} onChange={e=>setNid(e.target.value)} />
          <button onClick={()=>lookup("need")} className="mt-2 px-3 py-1.5 text-sm rounded bg-slate-900 text-white">検索</button>
        </div>
      </section>

      {err && <div className="rounded border border-red-200 bg-red-50 text-red-700 p-3 text-sm">{err}</div>}
      {loading && <div className="text-sm text-slate-500">読み込み中…</div>}

      {data?.proposal && (
        <section className="border rounded p-4 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Proposal: {data.proposal.id}</div>
              <div className="text-xs text-slate-500">need_id: {data.proposal.need_id} / vendor_id: {data.proposal.vendor_id} / status: {data.proposal.status}</div>
            </div>
            <div className="flex gap-2">
              {data.proposal.locked
                ? <button onClick={()=>lockProposal(false)} className="px-3 py-1.5 text-sm rounded border">ロック解除</button>
                : <button onClick={()=>lockProposal(true)} className="px-3 py-1.5 text-sm rounded bg-amber-600 text-white">ロック</button>}
            </div>
          </div>

          <div className="text-sm text-slate-700">Messages ({(data.messages||[]).length}):</div>
          <div className="max-h-96 overflow-auto border rounded">
            {(data.messages||[]).map((m:any)=>(
              <div key={m.id} className="p-2 border-b text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs text-slate-500">{m.id}</div>
                  <span className={`text-xs px-2 py-0.5 rounded ${m.visible?'bg-emerald-50 text-emerald-700 border border-emerald-200':'bg-slate-100 text-slate-600 border'}`}>
                    {m.visible?'visible':'pending'}
                  </span>
                </div>
                <div className="mt-1 whitespace-pre-wrap">{m.body}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={()=> {
                const ids = (data.messages||[]).filter((m:any)=>!m.visible).map((m:any)=>m.id);
                approveVisible(ids);
              }}
              className="px-3 py-1.5 text-sm rounded bg-slate-900 text-white">
              未承認メッセージを一括承認
            </button>
          </div>
        </section>
      )}

      {data?.need && (
        <section className="border rounded p-4 bg-white">
          <div className="font-medium">Need: {data.need.id} — {data.need.title}</div>
          <div className="text-xs text-slate-500">owner: {data.need.owner_id} / kind: {data.need.kind} / reveal: {data.need.user_reveal_policy}</div>
          <div className="mt-2 text-sm">Proposals: {(data.proposals||[]).length}</div>
        </section>
      )}

      {data?.message && (
        <section className="border rounded p-4 bg-white">
          <div className="font-medium">Message: {data.message.id}</div>
          <div className="text-xs text-slate-500">proposal_id: {data.message.proposal_id} / visible: {String(data.message.visible)}</div>
          <div className="mt-1 whitespace-pre-wrap text-sm">{data.message.body}</div>
        </section>
      )}
    </div>
  );
}
