export function Badge({ children, tone='slate' }:{ children: React.ReactNode; tone?: 'slate'|'amber'|'sky'|'red'}) {
  const map:any = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    sky:   'bg-sky-50 text-sky-700 border-sky-200',
    red:   'bg-red-50 text-red-700 border-red-200',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 text-xs border rounded ${map[tone]}`}>{children}</span>;
}
