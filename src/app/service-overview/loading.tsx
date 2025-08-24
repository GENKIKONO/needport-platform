export default function ServiceOverviewLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダースケルトン */}
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-200 rounded w-96 mb-4 animate-pulse mx-auto"></div>
          <div className="h-6 bg-gray-200 rounded w-80 animate-pulse mx-auto"></div>
        </div>

        {/* コンテンツスケルトン */}
        <div className="space-y-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
