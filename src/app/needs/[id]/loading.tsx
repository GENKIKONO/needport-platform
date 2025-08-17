export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8 space-y-4">
        <div className="skeleton-line h-8 w-3/4"></div>
        <div className="skeleton-line h-6 w-1/2"></div>
        <div className="flex gap-2">
          <div className="skeleton-line h-6 w-16"></div>
          <div className="skeleton-line h-6 w-20"></div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="space-y-6">
        <div className="bg-zinc-800 rounded-lg p-6 space-y-4">
          <div className="skeleton-line h-6 w-1/4"></div>
          <div className="space-y-2">
            <div className="skeleton-line"></div>
            <div className="skeleton-line w-5/6"></div>
            <div className="skeleton-line w-4/6"></div>
          </div>
        </div>

        {/* Offer skeleton */}
        <div className="bg-zinc-800 rounded-lg p-6 space-y-4">
          <div className="skeleton-line h-6 w-1/3"></div>
          <div className="flex justify-between items-center">
            <div className="skeleton-line h-8 w-32"></div>
            <div className="skeleton-btn w-24"></div>
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex gap-4">
          <div className="skeleton-btn h-12 w-32"></div>
          <div className="skeleton-btn h-12 w-32"></div>
        </div>
      </div>
    </div>
  );
}
