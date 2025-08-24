export default function KaichuLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダースケルトン */}
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-200 rounded w-64 mb-4 animate-pulse mx-auto"></div>
          <div className="h-6 bg-gray-200 rounded w-96 animate-pulse mx-auto"></div>
        </div>

        {/* 統計情報スケルトン */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="h-8 bg-gray-200 rounded w-16 mb-2 animate-pulse mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse mx-auto"></div>
            </div>
          ))}
        </div>

        {/* フィルタースケルトン */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* ニーズ一覧スケルトン */}
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="h-6 bg-gray-200 rounded w-64 mb-3 animate-pulse"></div>
              <div className="space-y-2">
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
