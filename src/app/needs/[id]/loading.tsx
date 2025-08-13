export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8 space-y-4">
        <div className="h-8 bg-gray-700 rounded w-3/4 animate-pulse"></div>
        <div className="h-6 bg-gray-700 rounded w-1/2 animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-700 rounded w-16 animate-pulse"></div>
          <div className="h-6 bg-gray-700 rounded w-20 animate-pulse"></div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="space-y-6">
        <div className="bg-zinc-800 rounded-lg p-6 space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/4 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-4/6 animate-pulse"></div>
          </div>
        </div>

        {/* Offer skeleton */}
        <div className="bg-zinc-800 rounded-lg p-6 space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3 animate-pulse"></div>
          <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-700 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-700 rounded w-24 animate-pulse"></div>
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex gap-4">
          <div className="h-12 bg-gray-700 rounded w-32 animate-pulse"></div>
          <div className="h-12 bg-gray-700 rounded w-32 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
