'use client';
import {BadgeIcon} from '@/components/icons';
export default function Deals(){
  const rows = [
    {id:'D-101', title:'テスト案件A', state:'進行中'},
    {id:'D-102', title:'テスト案件B', state:'成立'},
    {id:'D-103', title:'テスト案件C', state:'キャンセル'},
  ];
  const color = (s:string)=> s==='成立'?'bg-emerald-100 text-emerald-700': s==='進行中'?'bg-blue-100 text-blue-700':'bg-slate-200 text-slate-600';
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><BadgeIcon className="w-4 h-4"/> 成約案件一覧</h2>
      <div className="divide-y rounded-md border bg-white">
        {rows.map(r=>(
          <div key={r.id} className="p-4 flex items-center justify-between">
            <div className="font-medium">{r.title}</div>
            <span className={`px-2 py-1 rounded ${color(r.state)}`}>{r.state}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
