'use client';

import { useState } from 'react';
import { formatCurrency, formatDate } from '@/lib/ui/format';
import { config } from '@/lib/config';
import type { SummaryVersion } from '@/lib/mock/types';
import DiffBlock from './DiffBlock';

interface SummaryPanelProps {
  summaries: SummaryVersion[];
  className?: string;
}

export default function SummaryPanel({ summaries, className = '' }: SummaryPanelProps) {
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  if (summaries.length === 0) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <p className="text-gray-500 text-center">サマリーがありません</p>
      </div>
    );
  }

  const latestSummary = summaries.sort((a, b) => b.version - a.version)[0];
  const previousVersions = summaries
    .filter(s => s.version < latestSummary.version)
    .sort((a, b) => b.version - a.version);

  const handleVersionClick = (version: number) => {
    if (selectedVersion === version) {
      setShowDiff(!showDiff);
    } else {
      setSelectedVersion(version);
      setShowDiff(true);
    }
  };

  const selectedSummary = selectedVersion 
    ? summaries.find(s => s.version === selectedVersion)
    : null;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* 最新バージョン */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">合意サマリー v{latestSummary.version}</h3>
          <span className="text-sm text-gray-500">
            {formatDate(latestSummary.updatedAt)}
          </span>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">やること</h4>
            <ul className="space-y-1">
              {latestSummary.scope_do.map((item, index) => (
                <li key={index} className="text-sm text-gray-600">• {item}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">やらないこと</h4>
            <ul className="space-y-1">
              {latestSummary.scope_dont.map((item, index) => (
                <li key={index} className="text-sm text-gray-600">• {item}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">成果物</h4>
            <ul className="space-y-1">
              {latestSummary.deliverables.map((item, index) => (
                <li key={index} className="text-sm text-gray-600">• {item}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">価格</h4>
            <div className="text-lg font-semibold text-blue-600">
              {formatCurrency(latestSummary.price_initial)}
            </div>
            {latestSummary.price_change && (
              <div className="text-sm text-orange-600">
                差額: +{formatCurrency(latestSummary.price_change)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 差分表示 */}
      {showDiff && selectedSummary && config.ENABLE_DIFF_VIEW && (
        <div className="p-6 border-b border-gray-200">
          <DiffBlock prev={selectedSummary} next={latestSummary} />
        </div>
      )}

      {/* 過去バージョンリンク */}
      {previousVersions.length > 0 && (
        <div className="p-6">
          <h4 className="font-medium text-gray-700 mb-3">過去バージョン</h4>
          <div className="space-y-2">
            {previousVersions.map((summary) => (
              <button
                key={summary.version}
                onClick={() => handleVersionClick(summary.version)}
                className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">v{summary.version}</span>
                  <span className="text-sm text-gray-500">
                    {formatDate(summary.updatedAt)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {summary.authorRole === 'requester' ? '依頼者' : '提供者'}が更新
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* フッター */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          手数料10%（上限なし）
        </p>
      </div>
    </div>
  );
}
