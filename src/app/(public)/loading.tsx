export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Search skeleton */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
          <div className="w-32">
            <div className="h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
          <div className="w-20">
            <div className="h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Results count skeleton */}
      <div className="mb-6">
        <div className="h-4 bg-gray-700 rounded w-32 animate-pulse"></div>
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="h-6 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
              <div className="h-8 bg-gray-700 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
