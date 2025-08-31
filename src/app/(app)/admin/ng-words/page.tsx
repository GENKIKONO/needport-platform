'use client';
import useSWR from 'swr';
import { useState } from 'react';

const fetcher = (url:string)=> fetch(url).then(r=>r.json());

export default function NgWordsAdminPage(){
  const { data, mutate } = useSWR('/api/admin/ng-words', fetcher);
  const rows = data?.rows ?? [];
  const [form,setForm] = useState({ id:'', pattern:'', is_regex:false, severity:'medium', enabled:true, notes:'' });
  const [pvText,setPvText] = useState('ここにテキストを貼るとマッチ部分に色がつきます（メール・電話・住所などは伏字で投稿してください）。');
  const [pvHtml,setPvHtml] = useState('');

  const save = async ()=>{
    await fetch('/api/admin/ng-words', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(form) });
    setForm({ id:'', pattern:'', is_regex:false, severity:'medium', enabled:true, notes:'' });
    mutate();
  };
  const del = async (id:string)=>{
    await fetch(`/api/admin/ng-words?id=${id}`, { method:'DELETE' }); mutate();
  };
  const edit = (r:any)=> setForm({ id:r.id, pattern:r.pattern, is_regex:r.is_regex, severity:r.severity, enabled:r.enabled, notes:r.notes??'' });

  const preview = async ()=>{
    const res = await fetch('/api/admin/ng-words/preview', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ text: pvText }) });
    const j = await res.json();
    setPvHtml(j.html || '');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">NGワード管理</h1>

      <section className="border rounded p-4 space-y-3">
        <div className="grid md:grid-cols-6 gap-2">
          <input className="border rounded px-2 py-1 md:col-span-2" placeholder="パターン" value={form.pattern} onChange={e=>setForm({...form, pattern:e.target.value})}/>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_regex} onChange={e=>setForm({...form, is_regex:e.target.checked})}/>正規表現</label>
          <select className="border rounded px-2 py-1" value={form.severity} onChange={e=>setForm({...form, severity:e.target.value as any})}>
            <option value="low">low</option><option value="medium">medium</option><option value="high">high</option>
          </select>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.enabled} onChange={e=>setForm({...form, enabled:e.target.checked})}/>有効</label>
          <input className="border rounded px-2 py-1 md:col-span-2" placeholder="メモ（任意）" value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})}/>
          <div className="md:col-span-2 flex gap-2">
            <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={save}>{form.id ? '更新' : '追加'}</button>
            {form.id && <button className="px-3 py-1 rounded bg-gray-200" onClick={()=>setForm({ id:'', pattern:'', is_regex:false, severity:'medium', enabled:true, notes:'' })}>クリア</button>}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">※ 強度（severity）でハイライト色が変わります：low=薄黄 / medium=薄赤 / high=濃赤</div>
      </section>

      <section className="border rounded p-4 space-y-2">
        <h2 className="font-medium">登録済み</h2>
        <div className="divide-y">
          {rows.map((r:any)=>(
            <div key={r.id} className="py-2 flex items-center gap-3">
              <span className="text-xs px-2 py-0.5 rounded border">{r.is_regex ? 'regex' : 'text'}</span>
              <span className="font-mono">{r.pattern}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${r.severity==='high'?'bg-red-100 text-red-700':r.severity==='medium'?'bg-rose-50 text-rose-700':'bg-amber-50 text-amber-700'}`}>{r.severity}</span>
              <span className="text-xs">{r.enabled ? 'enabled' : 'disabled'}</span>
              <span className="text-xs text-muted-foreground">{r.notes}</span>
              <div className="ml-auto flex gap-2">
                <button className="px-2 py-1 rounded bg-gray-200" onClick={()=>edit(r)}>編集</button>
                <button className="px-2 py-1 rounded bg-rose-600 text-white" onClick={()=>del(r.id)}>削除</button>
              </div>
            </div>
          ))}
          {!rows.length && <div className="text-sm text-muted-foreground py-4">まだありません</div>}
        </div>
      </section>

      <section className="border rounded p-4 space-y-3">
        <h2 className="font-medium">プレビュー（色付きハイライト）</h2>
        <textarea className="w-full border rounded p-2 min-h-[120px]" value={pvText} onChange={e=>setPvText(e.target.value)} />
        <button className="px-3 py-1 rounded bg-emerald-600 text-white" onClick={preview}>ハイライト表示</button>
        <div className="border rounded p-3 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: pvHtml }} />
      </section>
    </div>
  );
}
