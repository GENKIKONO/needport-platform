'use client';

import { formatDate } from '@/lib/ui/format';
import type { Offer } from '@/lib/mock/types';

interface ConditionBadgeProps {
  offer: Offer | null;
}

export default function ConditionBadge({ offer }: ConditionBadgeProps) {
  if (!offer) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        成立条件：提供者の提示待ち
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
      最低{offer.min_people}名｜締切 {formatDate(offer.deadline)}
    </span>
  );
}
