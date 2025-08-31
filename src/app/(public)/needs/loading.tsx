export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <div className="h-6 w-40 bg-gray-200 animate-pulse rounded" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_,i)=>(
          <div key={i} className="border rounded p-4 space-y-2 animate-pulse">
            <div className="h-4 w-3/4 bg-gray-200 rounded"/>
            <div className="h-3 w-1/2 bg-gray-200 rounded"/>
            <div className="h-20 bg-gray-200 rounded"/>
          </div>
        ))}
      </div>
    </div>
  );
}
