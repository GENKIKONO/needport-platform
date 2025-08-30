'use client';

import { useEffect } from 'react';
import { captureException } from '@/lib/sentry';

export default function Error({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーを Sentry に送信
    captureException(error, {
      errorBoundary: true,
      component: 'ErrorBoundary',
    });
  }, [error]);

  return (
    <div style={{padding:24}}>
      <h1>エラーが発生しました</h1>
      <p>申し訳ございません。予期しないエラーが発生しました。</p>
      <button onClick={() => reset()}>再読み込み</button>
      <a href="/" style={{marginLeft:12}}>トップへ戻る</a>
    </div>
  );
}
