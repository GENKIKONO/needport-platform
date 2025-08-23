import { u } from './u';

export function Skeleton({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`${u.skeleton} ${className}`}
      {...props}
    />
  );
}

export function NeedCardSkeleton() {
  return (
    <div className={`${u.card} ${u.cardPad}`}>
      <div className="flex justify-between items-start mb-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-16" />
      </div>
      
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
      
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-14" />
      </div>
      
      <Skeleton className="h-8 w-24" />
    </div>
  );
}

export function KaichuSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <NeedCardSkeleton key={i} />
      ))}
    </div>
  );
}
