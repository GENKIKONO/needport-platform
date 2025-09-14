'use client';

import Link from 'next/link';
import EngagementButtons from './EngagementButtons';

interface NeedCardSimpleProps {
  need: {
    id: string;
    title: string;
    summary?: string;
    tags?: string[];
    condition?: string;
    published?: boolean;
  };
  className?: string;
}

export default function NeedCardSimple({ need, className = '' }: NeedCardSimpleProps) {
  if (!need.published) {
    return null; // Don't show unpublished needs
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <Link href={`/needs/${need.id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
            {need.title}
          </h3>
        </Link>
        
        {need.condition && (
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
            {need.condition}
          </span>
        )}
      </div>

      {/* Summary */}
      {need.summary && (
        <div className="mb-4">
          <p className="text-gray-600 text-sm line-clamp-3">
            {need.summary}
          </p>
        </div>
      )}

      {/* Tags */}
      {need.tags && need.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {need.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
            {need.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{need.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Engagement Buttons */}
      <EngagementButtons needId={need.id} className="mb-4" />

      {/* Detail Link */}
      <div className="pt-3 border-t border-gray-100">
        <Link
          href={`/needs/${need.id}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
        >
          詳細を見る →
        </Link>
      </div>
    </div>
  );
}