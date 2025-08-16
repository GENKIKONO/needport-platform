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
import { label, shouldShowPayments } from '@/lib/ui/labels';
import { showB2BFeatures } from '@/lib/flags';
import { variant, demoEndorseCount } from '@/lib/ab';
import { demoProposals } from '@/lib/b2b-demo';
import { demoIds } from '@/lib/admin/demo-data';
import ProposalCompare from './ProposalCompare';

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
  const [showProposals, setShowProposals] = useState(false);
  
  const scale = (need.scale ?? 'personal') as 'personal'|'community';
  const cta = mainCtaLabel(scale);

  // B2B 機能表示判定
  const showB2BHint = showB2BFeatures();
  const storage = typeof window !== 'undefined' ? window.localStorage : undefined;
  const abVariant = variant('b2b_endorse_pill_v1', ['A','B'], storage);
  const seed = need.id ?? `${need.title}|${Date.now()}`;
  const demoCount = demoEndorseCount(seed);
  const demoProposalList = demoProposals(seed, 3);
  
  // DEMO バッジ表示判定
  const showDemoBadge = process.env.NEXT_PUBLIC_SHOW_DEMO === '1' && 
                       showB2BFeatures() && 
                       demoIds().includes(need.id);

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
        // Update prejoin status
        await checkPrejoinStatus();
      } else {
        const error = await response.json();
        alert(error.error || '参加予約キャンセルに失敗しました');
      }
    } catch (error) {
      alert('参加予約キャンセルに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      e.preventDefault();
    }
  };

  const remaining = adoptedOffer ? Math.max(0, adoptedOffer.min_people - need.prejoin_count) : 0;

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${className}`}
      onClick={handleCardClick}
    >
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {need.title}
          </h3>
          <div className="flex items-center gap-2">
            <ConditionBadge condition={need.condition} />
            <span className="text-sm text-gray-500">
              {SCALE_LABEL[scale]}
            </span>
          </div>
        </div>
        
        {/* B2B 賛同ピル（右上） */}
        {showB2BHint && (
          <div className="flex flex-col items-end gap-1">
            <div 
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-xs font-medium"
              data-b2b-endorse-pill="v1"
              data-testid="b2b-endorse-pill"
            >
              <span>{label('Endorsements')}</span>
              <span className="tabular-nums">{demoCount}</span>
            </div>
            {abVariant === 'B' && (
              <div className="text-[10px] text-gray-500 leading-tight">
                {label('UnlockProposals')}
              </div>
            )}
            
            {/* 提案比較ボタン */}
            <button
              onClick={() => setShowProposals(!showProposals)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
              data-testid="btn-compare-proposals"
            >
              {label('CompareProposals')}
            </button>
            
            {/* 賛同閾値未満の演出 */}
            {abVariant === 'B' && demoCount < 10 && (
              <div className="text-[10px] text-gray-400">
                {label('UnlockAtTen')}
              </div>
            )}
          </div>
        )}
        
        {/* DEMO バッジ（右上） */}
        {showDemoBadge && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-medium">
              DEMO
            </span>
          </div>
        )}
      </div>

      {/* 進捗バー（条件確定時） */}
      {adoptedOffer && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{label('Payment')}</span>
            <span className="text-sm font-medium text-blue-600">
              {need.prejoin_count}/{adoptedOffer.min_people}名
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
            <span className="text-sm text-gray-600">{label('Supporter')}</span>
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
        {shouldShowPayments() && STRIPE_ENABLED && prejoinStatus?.hasPrejoined ? (
          <button
            onClick={handleCancelPrejoin}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            {isLoading ? '処理中...' : '参加予約キャンセル'}
          </button>
        ) : shouldShowPayments() && STRIPE_ENABLED ? (
          <button
            onClick={handlePrejoin}
            disabled={!adoptedOffer || isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            {isLoading ? '処理中...' : cta}
          </button>
        ) : !shouldShowPayments() ? (
          <div className="flex-1 px-4 py-2 bg-gray-100 text-gray-500 rounded-md text-center min-h-[44px] flex items-center justify-center">
            {label('ComingSoon')}
          </div>
        ) : null}
      </div>

      {/* 残数脚注 */}
      {adoptedOffer && (
        <div className="mb-4 text-xs text-gray-500">
          ※ 残人数の表示は、提供者提示の成⽴条件（min_people）に基づく表⽰です。
        </div>
      )}

      {/* 提案比較テーブル（B2B機能） */}
      {showB2BHint && showProposals && (
        <ProposalCompare proposals={demoProposalList} />
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
