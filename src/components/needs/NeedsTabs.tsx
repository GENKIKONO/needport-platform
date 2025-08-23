'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { trackNeeds } from '@/lib/track';

interface NeedsTabsProps {
  currentScope: string;
}

export default function NeedsTabs({ currentScope }: NeedsTabsProps) {
  const searchParams = useSearchParams();
  
  const tabs = [
    { id: 'active', label: 'アクティブ', href: '/needs?scope=active' },
    { id: 'kaichu', label: '海中', href: '/needs?scope=kaichu' },
    { id: 'all', label: 'すべて', href: '/needs?scope=all' }
  ];
  
  const handleTabClick = (scope: string) => {
    trackNeeds.tabClick(scope);
  };
  
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const isActive = currentScope === tab.id;
          const params = new URLSearchParams(searchParams.toString());
          params.set('scope', tab.id);
          const href = `/needs?${params.toString()}`;
          
          return (
            <Link
              key={tab.id}
              href={href}
              onClick={() => handleTabClick(tab.id)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${isActive 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
