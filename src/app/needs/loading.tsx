import { KaichuSkeleton } from '@/components/ui/Skeleton';

export default function NeedsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
      </div>
      
      <KaichuSkeleton />
    </div>
  );
}
