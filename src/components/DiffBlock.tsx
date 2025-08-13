'use client';

import type { SummaryVersion } from '@/lib/mock/types';

interface DiffBlockProps {
  prev: SummaryVersion;
  next: SummaryVersion;
  className?: string;
}

export default function DiffBlock({ prev, next, className = '' }: DiffBlockProps) {
  // 簡易的な差分表示（実際の実装ではより詳細な比較が必要）
  const changes: string[] = [];
  
  // 価格の変更
  if (prev.price_initial !== next.price_initial) {
    changes.push(`金額 ${prev.price_initial.toLocaleString()} → ${next.price_initial.toLocaleString()}`);
  }
  
  // マイルストーンの変更
  if (prev.milestones.length !== next.milestones.length) {
    changes.push(`マイルストーン ${prev.milestones.length} → ${next.milestones.length}`);
  }
  
  // スコープの変更
  if (prev.scope_do.length !== next.scope_do.length) {
    changes.push(`やること ${prev.scope_do.length} → ${next.scope_do.length}`);
  }

  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-3">
        変更：{changes.join('／')}
      </h3>
      
      <div className="space-y-4">
        {/* 価格の差分 */}
        {prev.price_initial !== next.price_initial && (
          <div className="flex items-center space-x-2">
            <span className="text-red-600">-¥{prev.price_initial.toLocaleString()}</span>
            <span>→</span>
            <span className="text-green-600">+¥{next.price_initial.toLocaleString()}</span>
          </div>
        )}
        
        {/* 追加された項目 */}
        {next.scope_do.length > prev.scope_do.length && (
          <div>
            <h4 className="font-medium text-green-700 mb-2">追加された項目：</h4>
            <ul className="space-y-1">
              {next.scope_do.slice(prev.scope_do.length).map((item, index) => (
                <li key={index} className="text-green-600 text-sm">+ {item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* 削除された項目 */}
        {prev.scope_do.length > next.scope_do.length && (
          <div>
            <h4 className="font-medium text-red-700 mb-2">削除された項目：</h4>
            <ul className="space-y-1">
              {prev.scope_do.slice(next.scope_do.length).map((item, index) => (
                <li key={index} className="text-red-600 text-sm">- {item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
