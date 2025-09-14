'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { FLAGS } from '@/config/flags';

interface EngagementButtonsProps {
  needId: string;
  className?: string;
}

interface EngagementData {
  interest_users: number;
  pledge_users: number;
  anon_interest_today: number;
  anon_interest_total: number;
  total_engagement: number;
  breakdown: {
    authenticated: {
      interest: number;
      pledge: number;
      total: number;
    };
    anonymous: {
      today: number;
      total: number;
    };
  };
}

export default function EngagementButtons({ needId, className = '' }: EngagementButtonsProps) {
  const { isSignedIn } = useUser();
  const [engagement, setEngagement] = useState<EngagementData | null>(null);
  const [loading, setLoading] = useState(false);

  // Feature flag check - early return if disabled
  if (!FLAGS.FEATURE_ENGAGEMENT) {
    return null;
  }

  // Fetch engagement data
  const fetchEngagementData = async () => {
    try {
      const response = await fetch(`/api/needs/${needId}/engagement/summary`);
      if (response.ok) {
        const data = await response.json();
        setEngagement(data);
      }
    } catch (error) {
      console.error('Failed to fetch engagement data:', error);
    }
  };

  useEffect(() => {
    fetchEngagementData();
    // Refresh data every 15 seconds
    const interval = setInterval(fetchEngagementData, 15000);
    return () => clearInterval(interval);
  }, [needId]);

  const handleEngagement = async (kind: 'interest' | 'pledge') => {
    if (loading) return;
    
    setLoading(true);
    
    // Optimistic update
    const prevEngagement = engagement;
    if (engagement) {
      const newEngagement = { ...engagement };
      if (isSignedIn) {
        if (kind === 'interest') {
          newEngagement.interest_users += 1;
        } else {
          newEngagement.pledge_users += 1;
        }
      } else {
        newEngagement.anon_interest_today += 1;
        newEngagement.anon_interest_total += 1;
      }
      newEngagement.total_engagement = newEngagement.interest_users + newEngagement.pledge_users + newEngagement.anon_interest_total;
      setEngagement(newEngagement);
    }

    try {
      const response = await fetch(`/api/needs/${needId}/engagement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kind }),
      });

      if (response.ok) {
        // Refresh data after successful engagement
        fetchEngagementData();
      } else {
        // Revert optimistic update on error
        setEngagement(prevEngagement);
      }
    } catch (error) {
      console.error('Failed to engage:', error);
      // Revert optimistic update on error
      setEngagement(prevEngagement);
    } finally {
      setLoading(false);
    }
  };

  if (!engagement) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Engagement Meter */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span>エンゲージメント</span>
          <span>{engagement.total_engagement}件</span>
        </div>
        
        {/* Dual bars with authenticated and anonymous engagement */}
        <div className="space-y-1">
          {/* Pledge bar (solid) */}
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${Math.min(100, (engagement.pledge_users / Math.max(engagement.total_engagement, 1)) * 100)}%` }}
            />
            {/* Anonymous overlay (dotted pattern) */}
            {engagement.anon_interest_total > 0 && (
              <div 
                className="absolute top-0 left-0 h-full bg-blue-300 transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, (engagement.anon_interest_total / Math.max(engagement.total_engagement, 1)) * 100)}%`,
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)'
                }}
              />
            )}
          </div>
          
          {/* Interest bar (light) */}
          <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-blue-300 transition-all duration-300"
              style={{ width: `${Math.min(100, (engagement.interest_users / Math.max(engagement.total_engagement, 1)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>関心: {engagement.interest_users + engagement.anon_interest_total}</span>
          <span>購入意欲: {engagement.pledge_users}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {isSignedIn ? (
          <>
            <button
              onClick={() => handleEngagement('interest')}
              disabled={loading}
              className="flex-1 min-h-[44px] px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white active:scale-95 touch-manipulation"
              aria-label="このニーズに興味があることを示す"
            >
              興味あり
            </button>
            <button
              onClick={() => handleEngagement('pledge')}
              disabled={loading}
              className="flex-1 min-h-[44px] px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white active:scale-95 touch-manipulation"
              aria-label="このニーズの商品やサービスを購入したいことを示す"
            >
              購入したい
            </button>
          </>
        ) : (
          <button
            onClick={() => handleEngagement('interest')}
            disabled={loading}
            className="w-full min-h-[44px] px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white active:scale-95 touch-manipulation"
            aria-label="このニーズが気になることを示す（ログイン後により詳しい情報を確認できます）"
          >
            気になる
          </button>
        )}
      </div>
    </div>
  );
}