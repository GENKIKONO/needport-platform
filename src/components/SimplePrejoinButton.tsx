'use client';

import { useState } from 'react';

interface SimplePrejoinButtonProps {
  needId: string;
  userId?: string;
  className?: string;
}

export default function SimplePrejoinButton({ needId, userId, className = '' }: SimplePrejoinButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasPrejoined, setHasPrejoined] = useState(false);

  const handlePrejoin = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/prejoins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          needId,
          userId,
        }),
      });
      
      const data = await response.json();
      
      if (data.ok) {
        setHasPrejoined(true);
        alert('参加予約が完了しました！');
      } else {
        alert(data.message || '参加予約に失敗しました');
      }
    } catch (error) {
      console.error('Prejoin error:', error);
      alert('参加予約に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (isLoading || !userId) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/prejoins', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          needId,
          userId,
        }),
      });
      
      const data = await response.json();
      
      if (data.ok) {
        setHasPrejoined(false);
        alert('参加予約をキャンセルしました');
      } else {
        alert(data.message || 'キャンセルに失敗しました');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('キャンセルに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (hasPrejoined) {
    return (
      <button
        onClick={handleCancel}
        disabled={isLoading || !userId}
        className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors ${className}`}
      >
        {isLoading ? '処理中...' : '参加予約キャンセル'}
      </button>
    );
  }

  return (
    <button
      onClick={handlePrejoin}
      disabled={isLoading}
      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {isLoading ? '処理中...' : '参加予約'}
    </button>
  );
}
