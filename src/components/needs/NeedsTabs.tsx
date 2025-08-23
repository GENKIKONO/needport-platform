'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { trackNeeds } from '@/lib/track';
import { u } from '@/components/ui/u';

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
    <div className={u.tabRoot}>
      <nav className={u.tabList} role="tablist">
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
              className={u.tabItem(isActive)}
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
              <span className={u.tabFusen(isActive)} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
