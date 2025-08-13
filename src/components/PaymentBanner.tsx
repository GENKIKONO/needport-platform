'use client';

import { formatCurrency } from '@/lib/ui/format';
import type { SummaryVersion } from '@/lib/mock/types';

interface PaymentBannerProps {
  summary: SummaryVersion;
  className?: string;
}

export default function PaymentBanner({ summary, className = '' }: PaymentBannerProps) {
  const handlePrimaryPayment = () => {
    console.log('payment_initial_view', summary.price_initial);
  };

  const handleSecondaryPayment = () => {
    if (summary.price_change) {
      console.log('payment_change_view', summary.price_change);
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">決済情報</h3>
      
      {/* 一次決済 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">一次決済</span>
          <span className="text-lg font-semibold">{formatCurrency(summary.price_initial)}</span>
        </div>
        <div className="text-xs text-gray-500 mb-3">
          手数料10%含む
        </div>
        <button
          onClick={handlePrimaryPayment}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors min-h-[44px]"
        >
          今すぐ決済
        </button>
      </div>
      
      {/* 二次決済（差分がある場合のみ） */}
      {summary.price_change && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">二次決済（差額）</span>
            <span className="text-lg font-semibold text-orange-600">
              +{formatCurrency(summary.price_change)}
            </span>
          </div>
          <div className="text-xs text-gray-500 mb-3">
            手数料10%含む
          </div>
          <button
            onClick={handleSecondaryPayment}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-md font-medium hover:bg-orange-700 transition-colors min-h-[44px]"
          >
            差額を決済
          </button>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        ※ 手数料10%（上限なし）
      </div>
    </div>
  );
}
