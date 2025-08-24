'use client';

import { useEffect } from 'react';

export default function RoomError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Room page error:', error);
    console.warn('Room error occurred:', {
      message: error.message,
      stack: error.stack?.slice(0, 200),
      digest: error.digest
    });
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-6">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            チャットルームの読み込みに失敗しました
          </h1>
          <p className="text-gray-600 mb-6">
            一時的なエラーが発生しました。しばらく時間をおいてから再度お試しください。
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            再試行
          </button>
          
          <div className="text-sm text-gray-500">
            <p>エラー詳細: {error.message}</p>
            {error.digest && <p>エラーID: {error.digest}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
