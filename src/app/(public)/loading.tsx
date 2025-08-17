export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Search skeleton */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="h-10 skeleton rounded-lg"></div>
          </div>
          <div className="w-32">
            <div className="h-10 skeleton rounded-lg"></div>
          </div>
          <div className="w-20">
            <div className="h-10 skeleton rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Results count skeleton */}
      <div className="mb-6">
        <div className="skeleton-line w-32"></div>
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="skeleton-line h-6"></div>
            <div className="skeleton-line w-3/4"></div>
            <div className="skeleton-line w-1/2"></div>
            <div className="flex justify-between items-center">
              <div className="skeleton-line w-20"></div>
              <div className="skeleton-btn w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
