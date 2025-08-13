'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SCALE_LABEL } from '@/lib/domain/need';

interface ScaleTabsProps {
  currentScale?: string;
  className?: string;
}

export default function ScaleTabs({ currentScale, className = '' }: ScaleTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleScaleChange = (scale: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (scale && scale !== 'all') {
      params.set('scale', scale);
    } else {
      params.delete('scale');
    }
    
    // Reset to first page when changing filter
    params.delete('page');
    
    router.push(`/?${params.toString()}`);
  };

  const tabs = [
    { value: 'all', label: 'すべて' },
    { value: 'personal', label: SCALE_LABEL.personal },
    { value: 'community', label: SCALE_LABEL.community },
  ];

  return (
    <div className={`flex items-center gap-2 mb-6 ${className}`}>
      <span className="text-sm font-medium">種類:</span>
      <div className="flex gap-1" role="tablist" aria-label="ニーズの種類でフィルタ">
        {tabs.map((tab) => {
          const isActive = (currentScale === tab.value) || (!currentScale && tab.value === 'all');
          return (
            <button
              key={tab.value}
              onClick={() => handleScaleChange(tab.value === 'all' ? null : tab.value)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isActive 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-transparent text-gray-400 border-gray-600 hover:bg-gray-600/20'
              }`}
              role="tab"
              aria-selected={isActive}
              aria-controls="needs-grid"
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
