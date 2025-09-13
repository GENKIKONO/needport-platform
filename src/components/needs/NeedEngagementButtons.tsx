// src/components/needs/NeedEngagementButtons.tsx
// Engagement buttons for expressing interest/pledge on needs

"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

interface NeedEngagementButtonsProps {
  needId: string;
  onEngagementChange?: () => void;
}

interface UserEngagement {
  interest: boolean;
  pledge: boolean;
}

export function NeedEngagementButtons({ needId, onEngagementChange }: NeedEngagementButtonsProps) {
  const { isSignedIn } = useUser();
  const [userEngagement, setUserEngagement] = useState<UserEngagement>({ interest: false, pledge: false });
  const [loading, setLoading] = useState(false);

  // Fetch user's current engagement status
  useEffect(() => {
    if (isSignedIn) {
      fetchUserEngagement();
    }
  }, [needId, isSignedIn]);

  const fetchUserEngagement = async () => {
    try {
      const response = await fetch(`/api/needs/${needId}/engagement/user`);
      if (response.ok) {
        const data = await response.json();
        setUserEngagement(data);
      }
    } catch (error) {
      console.error('Failed to fetch user engagement:', error);
    }
  };

  const handleEngagement = async (kind: 'interest' | 'pledge') => {
    setLoading(true);
    
    try {
      const isCurrentlyEngaged = userEngagement[kind];
      
      if (isCurrentlyEngaged) {
        // Remove engagement (toggle off)
        const response = await fetch(`/api/needs/${needId}/engagement?kind=${kind}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setUserEngagement(prev => ({ ...prev, [kind]: false }));
          toast.success(`${kind === 'pledge' ? '購入意向' : '興味'}を取り消しました`);
          onEngagementChange?.();
        } else {
          const error = await response.json();
          toast.error(error.error || '操作に失敗しました');
        }
      } else {
        // Add engagement
        const response = await fetch(`/api/needs/${needId}/engagement`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserEngagement(prev => ({ ...prev, [kind]: true }));
          toast.success(data.message || `${kind === 'pledge' ? '購入意向' : '興味'}を登録しました`);
          onEngagementChange?.();
        } else {
          const error = await response.json();
          toast.error(error.error || '操作に失敗しました');
        }
      }
    } catch (error) {
      console.error('Engagement error:', error);
      toast.error('操作に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousInterest = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/needs/${needId}/engagement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'interest' }),
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || '気になるを登録しました！');
        onEngagementChange?.();
        
        // Show login prompt
        setTimeout(() => {
          toast.success('購入意向を示すにはログインしてください', {
            duration: 5000,
          });
        }, 1000);
      } else {
        const error = await response.json();
        if (response.status === 429) {
          toast.error('しばらく時間をおいてから再度お試しください');
        } else {
          toast.error(error.error || '操作に失敗しました');
        }
      }
    } catch (error) {
      console.error('Anonymous interest error:', error);
      toast.error('操作に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) {
    // Anonymous user - only show "気になる" button
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={handleAnonymousInterest}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {loading ? '登録中...' : '気になる'}
        </button>
        <p className="text-xs text-slate-500 text-center">
          ログインして購入意向を示そう
        </p>
      </div>
    );
  }

  // Authenticated user - show both buttons
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={() => handleEngagement('pledge')}
          disabled={loading}
          className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            userEngagement.pledge
              ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
              : 'bg-white border-blue-600 text-blue-600 hover:bg-blue-50'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-.4 0L3 3m2 0h0m0 0L7 13m0 0l-1.9 9.6m1.9-9.6h10m-10 0a1 1 0 011-1h8a1 1 0 011 1v0a1 1 0 01-1 1H8a1 1 0 01-1-1v0z" />
          </svg>
          {userEngagement.pledge ? '購入したい ✓' : '購入したい'}
        </button>
        
        <button
          onClick={() => handleEngagement('interest')}
          disabled={loading}
          className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            userEngagement.interest
              ? 'bg-green-600 border-green-600 text-white hover:bg-green-700'
              : 'bg-white border-green-600 text-green-600 hover:bg-green-50'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {userEngagement.interest ? '興味あり ✓' : '興味あり'}
        </button>
      </div>
      
      {loading && (
        <p className="text-xs text-slate-500 text-center">処理中...</p>
      )}
    </div>
  );
}