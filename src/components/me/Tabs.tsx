'use client';
import {useMemo} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import { events } from '@/lib/events';
import { TabConfig } from './tabsConfig';

interface MeTabsProps {
  tabs: TabConfig[];
  current: string;
}

export default function MeTabs({ tabs, current }: MeTabsProps){
  const pathname = usePathname();
  const items = useMemo(()=>tabs,[]);

  const handleTabClick = (tabKey: string) => {
    events.track('me.tab_click', { tab: tabKey });
  };

  return (
    <nav className="sticky top-[var(--header-mobile,0)] z-10 bg-white/90 backdrop-blur border-b">
      <ul className="mx-auto max-w-6xl flex flex-wrap gap-2 p-2">
        {items.map(t=>{
          const active = current===t.key;
          return (
            <li key={t.key}>
              <Link 
                href={`${pathname}?t=${t.key}`} 
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm ${active?'bg-blue-600 text-white':'bg-slate-100 hover:bg-slate-200'}`}
                onClick={() => handleTabClick(t.key)}
              >
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
