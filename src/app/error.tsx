"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to our logging service
    console.error("Application error:", error);
    
    // Report error to client error logging if available
    if (typeof window !== 'undefined' && window.reportError) {
      window.reportError(error, window.location.pathname);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-red-200 mb-4">500</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            問題が発生しました
          </h2>
          <p className="text-gray-600 mb-8">
            申し訳ございません。予期しないエラーが発生しました。
            しばらく時間をおいてから再度お試しください。
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <button
              onClick={reset}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              再読み込み
            </button>
            
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ホームに戻る
            </Link>
            
            <Link
              href="/needs"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ニーズ一覧を見る
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                問題が解決しない場合
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                エラーの詳細を添えて、サポートチームにお問い合わせください。
              </p>
              <a
                href="mailto:support@needport.jp?subject=Application Error&body=Error: 500%0D%0APath: /%0D%0ATime: %0D%0A%0D%0APlease describe what you were doing when this error occurred:"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                support@needport.jp
              </a>
            </div>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                  開発者向け情報
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto">
                  <p><strong>Error:</strong> {error.name}</p>
                  <p><strong>Message:</strong> {error.message}</p>
                  {error.digest && (
                    <p><strong>Digest:</strong> {error.digest}</p>
                  )}
                  <p><strong>Stack:</strong></p>
                  <pre className="whitespace-pre-wrap">{error.stack}</pre>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
