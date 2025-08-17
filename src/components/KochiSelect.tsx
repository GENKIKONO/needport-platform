'use client';
import { useState } from 'react';
import { KOCHI_MUNICIPALITIES } from '@/lib/geo';

export default function KochiSelect({
  value, onChange, label="エリア（高知県）"
}:{ value?: {type:'list'|'other', area:string}, onChange:(v:{type:'list'|'other', area:string})=>void, label?:string }){
  const [mode, setMode] = useState<'list'|'other'>(value?.type ?? 'list');
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">{label}</label>
      <div className="flex gap-2">
        <button type="button" onClick={()=>{setMode('list'); onChange({type:'list', area:''})}}
          className={`px-3 h-9 rounded-lg border ${mode==='list'?'bg-blue-50 border-blue-300 text-blue-700':'border-neutral-300'}`}>
          高知県内
        </button>
        <button type="button" onClick={()=>{setMode('other'); onChange({type:'other', area:''})}}
          className={`px-3 h-9 rounded-lg border ${mode==='other'?'bg-blue-50 border-blue-300 text-blue-700':'border-neutral-300'}`}>
          その他（自由入力）
        </button>
      </div>

      {mode==='list' ? (
        <select
          className="np-input w-full h-11"
          value={value?.area ?? ''}
          onChange={e=>onChange({type:'list', area:e.target.value})}
        >
          <option value="" disabled>市町村を選択</option>
          {KOCHI_MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      ) : (
        <input
          className="np-input w-full h-11"
          placeholder="例: 徳島県三好市 など"
          value={value?.area ?? ''}
          onChange={e=>onChange({type:'other', area:e.target.value})}
        />
      )}
    </div>
  );
}
