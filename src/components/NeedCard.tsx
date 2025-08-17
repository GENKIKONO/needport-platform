'use client';

import { useEffect, useState, useTransition } from 'react';
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
import { getStatus, getCategory, isPubliclyVisible, getEndorseCount } from '@/lib/admin/mod-overlay';
import ProposalCompare from './ProposalCompare';
import ProposalForm from './ProposalForm';

interface NeedCardProps {
  need: Need;
  adoptedOffer: Offer | null;
  membership: Membership;
  className?: string;
}

export default function NeedCard({ need, adoptedOffer, membership, className = '' }: NeedCardProps) {
  const scale = (need.scale ?? 'personal') as 'personal'|'community';
  const cta = mainCtaLabel(scale);

  // B2B 機能表示判定
  const showB2BHint = showB2BFeatures();
  const storage = typeof window !== 'undefined' ? window.localStorage : undefined;
  const abVariant = variant('b2b_endorse_pill_v1', ['A','B'], storage);
  const seed = need.id ?? `${need.title}|${Date.now()}`;
  
  // 賛同数取得（オーバーライド優先）
  const overrideCount = getEndorseCount(need.id);
  const demoCount = overrideCount ?? demoEndorseCount(seed);
  const threshold = Number(process.env.NEXT_PUBLIC_DEMO_UNLOCK_THRESHOLD ?? 10);
  const isUnlocked = demoCount >= threshold;
  
  const demoProposalList = demoProposals(seed, 3);

  const [prejoinStatus, setPrejoinStatus] = useState<{
    hasPrejoined: boolean;
    status: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showProposals, setShowProposals] = useState(isUnlocked);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [toast, setToast] = useState('');
  const [endorseCount, setEndorseCount] = useState(need.prejoin_count || 0);
  const [isPending, startTransition] = useTransition();

  // 提案作成可能判定
  const canPropose = showB2BHint && 
    process.env.NEXT_PUBLIC_ALLOW_DEMO_PROPOSALS === '1' && 
    isUnlocked;
  
  // 承認制バッジ表示判定
  const modStatus = getStatus(need.id);
  const showModBadge = modStatus && modStatus !== 'approved';
  
  // カテゴリ上書き
  const displayCategory = getCategory(need.id) || need.tags[0];
  
  // バッジ優先順位: rejected > pending > demo > approved
  const getBadgeConfig = () => {
    if (modStatus === 'rejected') {
      return { text: '却下', className: 'bg-red-100 text-red-800', testId: 'badge-rejected' };
    }
    if (modStatus === 'pending') {
      return { text: '審査中', className: 'bg-gray-100 text-gray-800', testId: 'badge-pending' };
    }
    if (modStatus === 'demo') {
      return { text: 'DEMO', className: 'bg-orange-100 text-orange-800', testId: 'badge-demo' };
    }
    if (modStatus === 'approved') {
      return { text: '承認済み', className: 'bg-green-100 text-green-800', testId: 'badge-approved' };
    }
    return null;
  };
  
  const badgeConfig = getBadgeConfig();

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
    if (isPending) return;
    const prev = endorseCount;
    setEndorseCount(c => c + 1); // 楽観更新
    startTransition(async () => {
      try {
        const res = await fetch(`/api/needs/${need.id}/endorse`, { method: 'POST' });
        if (!res.ok) throw new Error();
        setToast('共感しました！');
        setTimeout(() => setToast(''), 3000);
      } catch {
        setEndorseCount(prev); // 失敗時に戻す
        setToast('エラーが発生しました');
        setTimeout(() => setToast(''), 3000);
      }
    });
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
      className={`card ${className}`}
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
            <div className="flex items-center gap-2">
              <div 
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-xs font-medium"
                data-b2b-endorse-pill="v1"
                data-testid="b2b-endorse-pill"
              >
                <span>{label('Endorsements')}</span>
                <span className="tabular-nums">{demoCount}</span>
              </div>
              {isUnlocked && (
                <span 
                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium"
                  data-testid="badge-unlocked"
                >
                  {label('Unlocked')}
                </span>
              )}
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
            
            {/* 提案作成ボタン */}
            {canPropose ? (
              <button
                onClick={() => setShowProposalForm(true)}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                data-testid="btn-create-proposal"
              >
                提案する
              </button>
            ) : showB2BHint && process.env.NEXT_PUBLIC_ALLOW_DEMO_PROPOSALS === '1' && !isUnlocked ? (
              <button
                disabled
                className="text-xs bg-gray-300 text-gray-500 px-3 py-1 rounded cursor-not-allowed"
                title="賛同が閾値に満たないため提案は解禁されていません"
                data-testid="btn-create-proposal-disabled"
              >
                提案する
              </button>
            ) : null}
            
            {/* 賛同閾値未満の演出 */}
            {abVariant === 'B' && demoCount < threshold && (
              <div className="text-[10px] text-gray-400">
                {label('UnlockAtTen')}
              </div>
            )}
          </div>
        )}
        
        {/* 承認制バッジ（右上） */}
        {badgeConfig && (
          <div className="absolute top-2 right-2">
            <span 
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeConfig.className}`}
              data-testid={badgeConfig.testId}
            >
              {badgeConfig.text}
            </span>
          </div>
        )}
        
        {/* 審査中オーバーレイ */}
        {modStatus === 'pending' && process.env.NEXT_PUBLIC_REQUIRE_APPROVAL === '1' && (
          <div className="absolute inset-0 bg-gray-50 bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="text-gray-500 text-sm font-medium">審査中</div>
              <div className="text-gray-400 text-xs">公開までお待ちください</div>
            </div>
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

      {/* カテゴリ */}
      <div className="mb-4">
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
          {displayCategory}
        </span>
      </div>

      {/* CTAボタン */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleEndorse}
          disabled={isPending}
          className="btn btn-ghost flex-1"
        >
          {isPending ? '処理中...' : `共感 ${endorseCount}`}
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
          <Link href="/admin/login" className="btn btn-primary w-full sm:w-auto flex-1">
            登録する
          </Link>
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
        <ProposalCompare proposals={demoProposalList} needId={need.id} />
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

      {/* 提案作成モーダル */}
      {showProposalForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <ProposalForm
            needId={need.id}
            onSaved={(draft) => {
              setShowProposalForm(false);
              setToast('提案を送信しました（デモ・審査中）');
              setTimeout(() => setToast(''), 3000);
              // 比較UIを更新
              setShowProposals(true);
            }}
            onCancel={() => setShowProposalForm(false)}
          />
        </div>
      )}

      {/* トースト通知 */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
