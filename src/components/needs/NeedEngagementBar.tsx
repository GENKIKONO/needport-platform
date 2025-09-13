// src/components/needs/NeedEngagementBar.tsx
// Engagement meter/bar component for visualizing collective demand

"use client";

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { formatEngagementDisplay, calculateEngagementPercentage, type EngagementSummary } from '@/lib/engagements';

interface NeedEngagementBarProps {
  needId: string;
  threshold?: number;
  className?: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function NeedEngagementBar({ needId, threshold = 5, className = '' }: NeedEngagementBarProps) {
  const { data: summary, error, mutate } = useSWR<EngagementSummary>(
    `/api/needs/${needId}/engagement/summary`,
    fetcher,
    {
      refreshInterval: 15000, // Poll every 15 seconds
      revalidateOnFocus: true,
      errorRetryCount: 3,
    }
  );

  // Refresh function that can be called from parent components
  const refresh = () => mutate();

  if (error) {
    return (
      <div className={`text-sm text-red-600 ${className}`}>
        エンゲージメント情報の取得に失敗しました
      </div>
    );
  }

  if (!summary) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-slate-200 rounded mb-2"></div>
        <div className="h-2 bg-slate-200 rounded"></div>
      </div>
    );
  }

  const { pledgeUsers, interestUsers } = summary;
  const totalUsers = pledgeUsers + interestUsers;
  const hasReachedThreshold = pledgeUsers >= threshold;
  
  // Calculate percentages for visual display
  const maxDisplay = Math.max(threshold * 1.2, totalUsers, 10); // Show at least some progress
  const pledgePercent = (pledgeUsers / maxDisplay) * 100;
  const interestPercent = (interestUsers / maxDisplay) * 100;
  const thresholdPercent = (threshold / maxDisplay) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          {/* Background progress bar */}
          <div className="relative h-full flex">
            {/* Pledge bar (primary) */}
            <div 
              className={`h-full transition-all duration-500 ${
                hasReachedThreshold ? 'bg-blue-600' : 'bg-blue-500'
              }`}
              style={{ width: `${pledgePercent}%` }}
            />
            {/* Interest bar (secondary) */}
            <div 
              className="h-full bg-green-400 transition-all duration-500"
              style={{ width: `${interestPercent}%` }}
            />
          </div>
        </div>
        
        {/* Threshold indicator */}
        <div 
          className="absolute top-0 h-3 w-0.5 bg-slate-400 transform -translate-x-0.5"
          style={{ left: `${thresholdPercent}%` }}
          title={`目標: ${threshold}人の購入希望`}
        />
      </div>

      {/* Stats and Labels */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3 text-slate-600">
          {pledgeUsers > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="font-medium">購入したい {pledgeUsers}</span>
            </div>
          )}
          
          {interestUsers > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span>興味あり {interestUsers}</span>
            </div>
          )}
          
          {summary.anon_interest_total > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-slate-300 rounded-full border border-slate-400" />
              <span className="text-slate-500">気になる {summary.anon_interest_total}</span>
            </div>
          )}
        </div>

        {/* Threshold status */}
        <div className={`text-xs font-medium ${
          hasReachedThreshold ? 'text-blue-600' : 'text-slate-500'
        }`}>
          {hasReachedThreshold ? (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              提案開始可能
            </span>
          ) : (
            <span>目標まで {threshold - pledgeUsers}</span>
          )}
        </div>
      </div>

      {/* Business Viability Message */}
      {hasReachedThreshold && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-blue-900">事業性が確認されました！</p>
              <p className="text-blue-700 mt-1">
                十分な購入希望が集まったため、事業者からの提案を受け付けることができます。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export refresh function type for parent components
export type EngagementBarRef = {
  refresh: () => void;
};