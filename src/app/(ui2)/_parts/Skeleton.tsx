export function Skeleton({className=""}:{className?:string}) {
  return <div className={`animate-pulse rounded bg-slate-200/70 ${className}`} />;
}
export function ListSkeleton({count=6}:{count?:number}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({length:count}).map((_,i)=>(
        <div key={i} className="border rounded-lg p-4">
          <div className="flex gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-3 w-24 mt-2" />
          <Skeleton className="h-3 w-full mt-3" />
          <Skeleton className="h-3 w-5/6 mt-2" />
          <Skeleton className="h-8 w-28 mt-4" />
        </div>
      ))}
    </div>
  );
}
