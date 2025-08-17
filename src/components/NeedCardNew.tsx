'use client';
import { useState } from 'react';
import Link from 'next/link';
import InterestModal from './InterestModal';

interface NeedCardNewProps {
  id: string;
  title: string;
  description: string;
  category: string;
  area: string;
  targetPeople: number;
  currentPeople: number;
  deadline: string;
}

export default function NeedCardNew({ 
  id, 
  title, 
  description, 
  category, 
  area, 
  targetPeople, 
  currentPeople, 
  deadline 
}: NeedCardNewProps) {
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [hasEndorsed, setHasEndorsed] = useState(false);

  const remainingDays = Math.max(0, Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  const progressPercentage = targetPeople > 0 ? Math.min((currentPeople / targetPeople) * 100, 100) : 0;

  const handleEndorse = () => {
    // Check if already endorsed
    const endorsedKey = `endorsed:${id}`;
    if (typeof window !== 'undefined' && localStorage.getItem(endorsedKey)) {
      return;
    }

    setShowInterestModal(true);
  };

  const handleInterestSelect = async (level: 'buy' | 'maybe' | 'interest') => {
    // Mark as endorsed
    if (typeof window !== 'undefined') {
      localStorage.setItem(`endorsed:${id}`, 'true');
    }
    setHasEndorsed(true);

    // Send to API if available
    try {
      const res = await fetch(`/api/needs/${id}/interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      });
      if (!res.ok) {
        console.warn('Failed to send interest to API');
      }
    } catch (error) {
      console.warn('API not available, interest recorded locally');
    }
  };

  return (
    <>
      <div className="card p-6 hover:shadow-xl transition-shadow">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2">
            <span className="chip text-amber-600 bg-amber-100/20">
              あと{remainingDays}日
            </span>
            <span className="chip text-emerald-600 bg-emerald-100/20">
              あと{targetPeople - currentPeople}人
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Category & Area */}
        <div className="flex gap-2 mb-4">
          <span className="chip text-blue-600 bg-blue-100/20">
            {category}
          </span>
          <span className="chip text-neutral-400 bg-neutral-100/20">
            {area}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="progress">
            <div 
              className="progress-bar" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            {currentPeople}/{targetPeople}人 ({Math.round(progressPercentage)}%)
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleEndorse}
            disabled={hasEndorsed}
            className={`btn flex-1 ${
              hasEndorsed 
                ? 'btn-ghost text-emerald-400' 
                : 'btn-primary'
            }`}
          >
            {hasEndorsed ? '賛同済み' : 'いますぐ賛同する'}
          </button>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-2 mb-4">
          <button className="btn btn-ghost flex-1 text-sm">
            📱 LINE
          </button>
          <button className="btn btn-ghost flex-1 text-sm">
            🐦 X
          </button>
        </div>

        {/* Detail Link */}
        <Link
          href={`/needs/${id}`}
          className="text-brand-600 underline-offset-4 hover:underline text-sm font-medium"
        >
          詳細を見る →
        </Link>
      </div>

      <InterestModal
        isOpen={showInterestModal}
        onClose={() => setShowInterestModal(false)}
        onSelect={handleInterestSelect}
        needTitle={title}
      />
    </>
  );
}
