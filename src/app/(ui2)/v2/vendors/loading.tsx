export default function Loading(){
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:6}).map((_,i)=>(<div key={i} className="h-28 rounded bg-slate-100 animate-pulse" />))}</div>;
}
