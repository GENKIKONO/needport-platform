"use client";
import { useState } from "react";

export default function NewNeedCareTaxi() {
  const [kind,setKind] = useState<'care_taxi'|'default'>('care_taxi');
  const [form,setForm] = useState({
    title:'', summary:'',
    when_date:'', when_time:'',
    where_from:'', where_to:'',
    who_count:1, wheelchair:false, helpers_needed:0, notes:''
  });
  const submit = async (e:React.FormEvent) => {
    e.preventDefault();
    const r = await fetch('/api/needs/create', {
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({ kind, ...form })
    });
    const j = await r.json();
    alert(r.ok ? '投稿を受け付けました（審査待ち）' : `エラー: ${j.error||'unknown'}`);
  };
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">介護タクシーの依頼（5W1H簡易投稿）</h1>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-sm">いつ（日付）</span>
            <input type="date" className="input" value={form.when_date} onChange={e=>setForm(s=>({...s,when_date:e.target.value}))}/>
          </label>
          <label className="space-y-1">
            <span className="text-sm">いつ（時間）</span>
            <input type="time" className="input" value={form.when_time} onChange={e=>setForm(s=>({...s,when_time:e.target.value}))}/>
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm">どこから（出発）</span>
            <input className="input" placeholder="例：高知市○○町..." value={form.where_from} onChange={e=>setForm(s=>({...s,where_from:e.target.value}))}/>
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm">どこへ（到着）</span>
            <input className="input" placeholder="例：高知県立○○病院..." value={form.where_to} onChange={e=>setForm(s=>({...s,where_to:e.target.value}))}/>
          </label>
          <label className="space-y-1">
            <span className="text-sm">誰（人数）</span>
            <input type="number" className="input" min={1} value={form.who_count} onChange={e=>setForm(s=>({...s,who_count:Number(e.target.value)}))}/>
          </label>
          <label className="space-y-1">
            <span className="text-sm">車椅子</span>
            <select className="input" value={String(form.wheelchair)} onChange={e=>setForm(s=>({...s,wheelchair:e.target.value==='true'}))}>
              <option value="false">不要</option>
              <option value="true">必要</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-sm">介助人数の希望</span>
            <input type="number" className="input" min={0} value={form.helpers_needed} onChange={e=>setForm(s=>({...s,helpers_needed:Number(e.target.value)}))}/>
          </label>
        </div>

        <label className="space-y-1 block">
          <span className="text-sm">タイトル（任意）</span>
          <input className="input" value={form.title} onChange={e=>setForm(s=>({...s,title:e.target.value}))} placeholder="例：○/○（火）病院までの送迎"/>
        </label>
        <label className="space-y-1 block">
          <span className="text-sm">概要（任意・個人情報は書かないでください）</span>
          <textarea className="textarea" rows={4} value={form.summary} onChange={e=>setForm(s=>({...s,summary:e.target.value}))}/>
        </label>

        <button className="btn-primary">審査に出す</button>
        <p className="text-xs text-muted-foreground">※ 投稿は管理者の承認後に公開されます。詳細住所は公開時に伏字化されます。</p>
      </form>
    </div>
  );
}
