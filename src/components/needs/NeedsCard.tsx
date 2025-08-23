import Link from 'next/link';
import { isKaichuNeed } from '@/lib/needs/scope';
import { getDevSession } from '@/lib/devAuth';

interface NeedCard {
  id: string;
  title: string;
  summary: string;
  body?: string;
  area: string;
  tags: string[];
  status: string;
  created_at: string;
  updated_at: string;
  prejoin_count: number;
}

interface NeedsCardProps {
  need: NeedCard;
  scope: string;
  isPreview?: boolean;
}

function getStatusBadge(status: string) {
  const statusMap = {
    'active': { label: '募集', className: 'bg-green-100 text-green-800' },
    'pending': { label: '交渉中', className: 'bg-yellow-100 text-yellow-800' },
    'closed': { label: '終了', className: 'bg-gray-100 text-gray-800' },
    'archived': { label: '保管', className: 'bg-blue-100 text-blue-800' }
  };
  
  const config = statusMap[status as keyof typeof statusMap] || statusMap['active'];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return '今日';
  if (diffInDays === 1) return '昨日';
  if (diffInDays < 7) return `${diffInDays}日前`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}週間前`;
  return `${Math.floor(diffInDays / 30)}ヶ月前`;
}

export default function NeedsCard({ need, scope, isPreview = false }: NeedsCardProps) {
  const devSession = getDevSession();
  const isAuthenticated = !!devSession;
  const isKaichu = isKaichuNeed(need);
  const showFullContent = isAuthenticated && !isPreview;
  
  return (
    <Link 
      href={`/needs/${need.id}`}
      className="block bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
      aria-label={`${need.title}の詳細を見る`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {need.title}
        </h3>
        <div className="flex gap-2">
          {isKaichu && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              海中
            </span>
          )}
          {getStatusBadge(need.status)}
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-600 text-sm line-clamp-3">
          {need.summary}
        </p>
        {showFullContent && need.body && (
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {need.body}
          </p>
        )}
        {!showFullContent && (
          <div className="mt-3 p-3 bg-blue-50 rounded-md">
            <p className="text-blue-700 text-sm font-medium">
              続きはログイン/登録で
            </p>
            <p className="text-blue-600 text-xs mt-1">
              詳細な内容と連絡先をご確認いただけます
            </p>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {need.area}
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {need.tags.slice(0, 2).join(', ')}
          </span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {need.prejoin_count}
          </span>
          <span>
            {formatDate(need.updated_at)}
          </span>
        </div>
      </div>
      
      {need.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {need.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
            >
              {tag}
            </span>
          ))}
          {need.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
              +{need.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
