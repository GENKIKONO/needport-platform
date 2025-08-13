"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PrejoinButtonProps {
  needId: string;
  disabled?: boolean;
  className?: string;
}

interface QueuedPrejoin {
  needId: string;
  timestamp: number;
}

export default function PrejoinButton({ 
  needId, 
  disabled = false, 
  className = "" 
}: PrejoinButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineNotice(false);
      flushOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getOfflineQueue = (): QueuedPrejoin[] => {
    try {
      const queue = localStorage.getItem('np_prejoin_queue');
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Error reading offline queue:', error);
      return [];
    }
  };

  const addToOfflineQueue = (needId: string) => {
    try {
      const queue = getOfflineQueue();
      const newItem: QueuedPrejoin = {
        needId,
        timestamp: Date.now()
      };
      
      // Avoid duplicates
      if (!queue.find(item => item.needId === needId)) {
        queue.push(newItem);
        localStorage.setItem('np_prejoin_queue', JSON.stringify(queue));
      }
    } catch (error) {
      console.error('Error adding to offline queue:', error);
    }
  };

  const removeFromOfflineQueue = (needId: string) => {
    try {
      const queue = getOfflineQueue();
      const filteredQueue = queue.filter(item => item.needId !== needId);
      localStorage.setItem('np_prejoin_queue', JSON.stringify(filteredQueue));
    } catch (error) {
      console.error('Error removing from offline queue:', error);
    }
  };

  const flushOfflineQueue = async () => {
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    console.log(`Flushing offline queue with ${queue.length} items`);

    for (const item of queue) {
      try {
        const response = await fetch('/api/prejoins', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            needId: item.needId
          }),
        });

        if (response.ok) {
          removeFromOfflineQueue(item.needId);
          console.log(`Successfully sent queued prejoin for need ${item.needId}`);
        } else {
          console.error(`Failed to send queued prejoin for need ${item.needId}`);
        }
      } catch (error) {
        console.error(`Error sending queued prejoin for need ${item.needId}:`, error);
      }
    }
  };

  const handlePrejoin = async () => {
    if (disabled || isSubmitting) return;

    // Check if offline
    if (!navigator.onLine) {
      addToOfflineQueue(needId);
      setShowOfflineNotice(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/prejoins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          needId
        }),
      });

      if (response.ok) {
        // Success - redirect to room or show success message
        const data = await response.json();
        if (data.roomId) {
          router.push(`/rooms/${data.roomId}`);
        } else {
          // Fallback to need detail page
          router.push(`/needs/${needId}`);
        }
      } else {
        const errorData = await response.json();
        console.error('Prejoin failed:', errorData);
        alert('参加予約に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      console.error('Prejoin error:', error);
      
      // If network error, add to offline queue
      if (!navigator.onLine) {
        addToOfflineQueue(needId);
        setShowOfflineNotice(true);
      } else {
        alert('参加予約に失敗しました。もう一度お試しください。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handlePrejoin}
        disabled={disabled || isSubmitting}
        className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors ${className}`}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline"></div>
            送信中...
          </>
        ) : (
          '参加予約'
        )}
      </button>

      {/* Offline Notice */}
      {showOfflineNotice && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            オフライン中。再接続後に送信します。
          </div>
        </div>
      )}

      {/* Online Status Indicator */}
      {!isOnline && !showOfflineNotice && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-gray-100 border border-gray-200 rounded text-xs text-gray-600 text-center">
          オフライン
        </div>
      )}
    </div>
  );
}
