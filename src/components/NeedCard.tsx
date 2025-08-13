'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatRemainingPeople } from '@/lib/ui/format';
import { config } from '@/lib/config';
import type { Need, Offer, Membership } from '@/lib/mock/types';
import ConditionBadge from './ConditionBadge';
import JoinGate from './JoinGate';
import { STRIPE_ENABLED } from '@/lib/featureFlags';
import { SCALE_LABEL, isCommunity, mainCtaLabel } from '@/lib/domain/need';

interface NeedCardProps {
  need: Need;
  adoptedOffer: Offer | null;
  membership: Membership;
  className?: string;
}

export default function NeedCard({ need, adoptedOffer, membership, className = '' }: NeedCardProps) {
  const [prejoinStatus, setPrejoinStatus] = useState<{
    hasPrejoined: boolean;
    status: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const scale = (need.scale ?? 'personal') as 'personal'|'community';
  const cta = mainCtaLabel(scale);

  useEffect(() => {
    // Check prejoin status on mount (only if Stripe is enabled)
    if (STRIPE_ENABLED) {
      checkPrejoinStatus();
    }
  }, [need.id]);

  const checkPrejoinStatus = async () => {
    try {
      const response = await fetch(`/api/prejoin/status?needId=${need.id}`);
      if (response.ok) {
        const data = await response.json();
        setPrejoinStatus(data);
      }
    } catch (error) {
      console.error('Failed to check prejoin status:', error);
    }
  };

  const handleEndorse = () => {
    // TODO: Implement endorse functionality
  };

  const handlePrejoin = async () => {
    if (!STRIPE_ENABLED || isLoading) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/prejoin/setup-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          needId: need.id,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update prejoin status
        await checkPrejoinStatus();
        // TODO: Handle SetupIntent confirmation with Stripe.js
      } else {
        const error = await response.json();
        alert(error.error || '参加予約に失敗しました');
      }
    } catch (error) {
      alert('参加予約に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelPrejoin = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/prejoin/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          needId: need.id,
        }),
      });
      
      if (response.ok) {
        await checkPrejoinStatus();
        alert('参加予約をキャンセルしました');
      } else {
        const error = await response.json();
        alert(error.error || 'キャンセルに失敗しました');
      }
    } catch (error) {
      alert('キャンセルに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = () => {
    // TODO: Implement card click tracking
  };

  const remaining = adoptedOffer 
    ? Math.max(0, adoptedOffer.min_people - need.prejoin_count)
    : 0;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow ${className}`}>
      {/* ヘッダー */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {need.title}
          </h3>
          <span className="ml-2 text-sm text-gray-500">
            {need.area || '全国対応'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 text-xs font-medium">
            {SCALE_LABEL[scale]}
          </span>
          <ConditionBadge offer={adoptedOffer} />
        </div>
        
        {/* Community hints block */}
        {isCommunity(scale) && (need.macro_fee_hint || need.macro_use_freq || need.macro_area_hint) && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 border border-gray-200">
            <div className="font-medium mb-2 text-gray-700">概要</div>
            <div className="space-y-1">
              {need.macro_fee_hint && (
                <div><span className="font-medium">会費目安:</span> {need.macro_fee_hint}</div>
              )}
              {need.macro_use_freq && (
                <div><span className="font-medium">利用頻度:</span> {need.macro_use_freq}</div>
              )}
              {need.macro_area_hint && (
                <div><span className="font-medium">対象エリア:</span> {need.macro_area_hint}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 進捗表示（条件確定時のみ） */}
      {adoptedOffer && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">参加予約</span>
            <span className="text-sm font-medium">
              {need.prejoin_count}名 / {adoptedOffer.min_people}名
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (need.prejoin_count / adoptedOffer.min_people) * 100)}%` }}
            />
          </div>
          <div className="text-sm text-blue-600 font-medium mt-1">
            {formatRemainingPeople(remaining)}
          </div>
        </div>
      )}

      {/* 賛同数表示（条件未確定時） */}
      {!adoptedOffer && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">賛同</span>
            <span className="text-sm font-medium text-blue-600">
              {need.prejoin_count}名
            </span>
          </div>
        </div>
      )}

      {/* 本文 */}
      <div className="mb-4">
        <p className="text-gray-600 text-sm line-clamp-3">
          {need.summary}
        </p>
      </div>

      {/* タグ */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {need.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* CTAボタン */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleEndorse}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors min-h-[44px]"
        >
          共感
        </button>
        {STRIPE_ENABLED && prejoinStatus?.hasPrejoined ? (
          <button
            onClick={handleCancelPrejoin}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            {isLoading ? '処理中...' : '参加予約キャンセル'}
          </button>
        ) : STRIPE_ENABLED ? (
          <button
            onClick={handlePrejoin}
            disabled={!adoptedOffer || isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            {isLoading ? '処理中...' : cta}
          </button>
        ) : null}
      </div>

      {/* 残数脚注 */}
      {adoptedOffer && (
        <div className="mb-4 text-xs text-gray-500">
          ※ 残人数の表示は、提供者提示の成⽴条件（min_people）に基づく表⽰です。
        </div>
      )}

      {/* 詳細リンク */}
      <div className="mb-4">
        <Link
          href={`/needs/${need.id}`}
          onClick={handleCardClick}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          詳細を見る →
        </Link>
      </div>

      {/* 会員ゲート（ゲストのみ） */}
      {membership.isGuest && config.GUEST_VIEW && (
        <JoinGate />
      )}
    </div>
  );
}
