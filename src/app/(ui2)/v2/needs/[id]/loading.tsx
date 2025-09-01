export default function Loading(){
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-3">
      <div className="h-8 w-2/3 rounded bg-slate-100 animate-pulse" />
      <div className="h-6 w-1/2 rounded bg-slate-100 animate-pulse" />
      <div className="h-32 rounded bg-slate-100 animate-pulse" />
    </div>
  );
}
