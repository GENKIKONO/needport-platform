'use client';

import { useEffect } from 'react';
import { events } from '@/lib/events';

export default function NeedsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーをログに記録
    console.error('Needs page error:', error);
    
    // イベント追跡（無害化）
    try {
      events.track('needs.error', {
        message: error.message,
        stack: error.stack?.slice(0, 200),
        digest: error.digest
      });
    } catch (trackError) {
      console.warn('Failed to track error:', trackError);
    }
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          ニーズ一覧の読み込みに失敗しました
        </h2>
        <p className="text-gray-600 mb-6">
          一時的な問題が発生しました。もう一度お試しください。
        </p>
        <button
          onClick={reset}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          再読み込み
        </button>
      </div>
    </div>
  );
}
