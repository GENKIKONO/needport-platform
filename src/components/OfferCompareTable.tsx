'use client';

import { formatCurrency, formatDateTime } from '@/lib/ui/format';
import type { Offer } from '@/lib/mock/types';

interface OfferCompareTableProps {
  offers: Offer[];
  needId: string;
  className?: string;
}

export default function OfferCompareTable({ offers, needId, className = '' }: OfferCompareTableProps) {
  const handleAdoptOffer = (offerId: string) => {
    console.log('adopt_offer', offerId);
  };

  if (offers.length === 0) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <p className="text-gray-500 text-center">オファーがありません</p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">オファー比較</h2>
        <p className="text-sm text-gray-600 mt-1">ニーズID: {needId}</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">最低人数</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">最大人数</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">締切</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">概算</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">注記</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">応答時刻</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {offers.map((offer) => (
              <tr key={offer.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {offer.min_people}名
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {offer.max_people ? `${offer.max_people}名` : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatDateTime(offer.deadline)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {typeof offer.price_value === 'number' 
                    ? formatCurrency(offer.price_value)
                    : `${formatCurrency(offer.price_value.min)} - ${formatCurrency(offer.price_value.max)}`
                  }
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                  {offer.note || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {/* TODO: 応答時刻の実装 */}
                  -
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleAdoptOffer(offer.id)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors min-h-[32px]"
                  >
                    採用する
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
