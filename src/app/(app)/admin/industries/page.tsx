'use client';
import { useEffect, useState } from 'react';

type Ind = { id?:string; slug:string; name:string; fee_applicable:boolean; description?:string; sort_order?:number; enabled?:boolean };

export default function IndustriesAdminPage(){
  const [rows,setRows]=useState<Ind[]>([]);
  const [edit,setEdit]=useState<Ind>({slug:'',name:'',fee_applicable:true,enabled:true,sort_order:100});
  const load=async()=>{
    const r=await fetch('/api/admin/industries'); const j=await r.json(); setRows(j.rows||[]);
  };
  useEffect(()=>{load();},[]);
  const save=async()=>{
    await fetch('/api/admin/industries',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(edit)});
    setEdit({slug:'',name:'',fee_applicable:true,enabled:true,sort_order:100}); load();
  };
  const del=async(id:string)=>{
    if(!confirm('削除しますか？'))return;
    await fetch('/api/admin/industries',{method:'DELETE',headers:{'content-type':'application/json'},body:JSON.stringify({id})}); load();
  };
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">業種管理</h1>
      <div className="p-4 border rounded space-y-2">
        <div className="grid sm:grid-cols-2 gap-3">
          <input className="input" placeholder="slug" value={edit.slug} onChange={e=>setEdit(s=>({...s,slug:e.target.value}))}/>
          <input className="input" placeholder="name" value={edit.name} onChange={e=>setEdit(s=>({...s,name:e.target.value}))}/>
          <select className="input" value={String(edit.fee_applicable)} onChange={e=>setEdit(s=>({...s,fee_applicable:e.target.value==='true'}))}>
            <option value="true">成果報酬 対象</option>
            <option value="false">成果報酬 対象外</option>
          </select>
          <input className="input" type="number" placeholder="sort_order" value={edit.sort_order||100} onChange={e=>setEdit(s=>({...s,sort_order:Number(e.target.value)}))}/>
          <select className="input" value={String(edit.enabled??true)} onChange={e=>setEdit(s=>({...s,enabled:e.target.value==='true'}))}>
            <option value="true">enabled</option>
            <option value="false">disabled</option>
          </select>
        </div>
        <textarea className="textarea" rows={3} placeholder="description" value={edit.description||''} onChange={e=>setEdit(s=>({...s,description:e.target.value}))}/>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={save}>保存</button>
          {edit.id && <button className="btn" onClick={()=>setEdit({slug:'',name:'',fee_applicable:true,enabled:true,sort_order:100})}>新規に切替</button>}
        </div>
      </div>
      <div className="space-y-2">
        {rows.map(r=>(
          <div key={r.id} className="p-3 border rounded flex items-center justify-between">
            <div>
              <div className="font-medium">{r.name} <span className="text-xs text-slate-500">({r.slug})</span></div>
              <div className="text-xs text-slate-500">{r.fee_applicable? '成果報酬 対象':'成果報酬 対象外'} / sort:{r.sort_order} / {r.enabled?'enabled':'disabled'}</div>
            </div>
            <div className="flex gap-2">
              <button className="btn" onClick={()=>setEdit(r)}>編集</button>
              <button className="btn-danger" onClick={()=>del(r.id!)}>削除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
