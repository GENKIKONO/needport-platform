import { KaichuSkeleton } from '@/components/ui/Skeleton';

export default function NeedsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダースケルトン */}
      <div className="mb-6 text-center lg:text-left">
        <div className="h-8 lg:h-10 bg-gray-200 rounded w-48 lg:w-64 mb-2 animate-pulse mx-auto lg:mx-0"></div>
        <div className="h-4 bg-gray-200 rounded w-80 lg:w-96 animate-pulse mx-auto lg:mx-0"></div>
      </div>
      
      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        {/* メインコンテンツ */}
        <div className="lg:col-span-3">
          {/* 検索フォームスケルトン */}
          <div className="mb-6">
            <div className="hidden lg:flex gap-4 items-end">
              <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-48 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-48 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-48 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex gap-2">
                <div className="w-16 h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="lg:hidden">
              <div className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* 結果件数スケルトン */}
          <div className="mb-6 h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          
          {/* カードスケルトン */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        
        {/* サイドバースケルトン */}
        <div className="lg:col-span-1 mt-8 lg:mt-0 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
