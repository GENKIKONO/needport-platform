'use client';

import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface AuthFallbackProps {
  error?: string;
  showDiagnostics?: boolean;
  onRetry?: () => void;
}

interface DiagnosticInfo {
  clerkLoaded: boolean;
  publishableKey: string | null;
  currentUrl: string;
  userAgent: string;
  errors: string[];
}

/**
 * Authentication Fallback Component
 * 
 * Displays when Clerk authentication fails to initialize or configure properly.
 * Provides users with clear error messages and diagnostic information.
 * Includes self-diagnosis tools and contact information.
 */
export default function AuthFallback({ error, showDiagnostics = false, onRetry }: AuthFallbackProps) {
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (showDiagnostics) {
      collectDiagnostics();
    }
  }, [showDiagnostics]);

  const collectDiagnostics = async () => {
    const diag: DiagnosticInfo = {
      clerkLoaded: typeof (window as any).Clerk !== 'undefined',
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || null,
      currentUrl: window.location.href,
      userAgent: navigator.userAgent,
      errors: []
    };

    // Check for console errors
    const originalError = console.error;
    const collectedErrors: string[] = [];
    
    console.error = (...args: any[]) => {
      const errorText = args.join(' ');
      if (errorText.toLowerCase().includes('clerk')) {
        collectedErrors.push(errorText);
      }
      originalError.apply(console, args);
    };

    // Wait a bit for any async errors
    setTimeout(() => {
      diag.errors = collectedErrors;
      setDiagnostics(diag);
      console.error = originalError;
    }, 2000);
  };

  const getErrorSuggestion = (error?: string) => {
    if (!error) return null;

    const suggestions: { [key: string]: string } = {
      'publishable': 'Clerk公開キーが設定されていません。運営にお問い合わせください。',
      'network': 'ネットワーク接続を確認してページを再読み込みしてください。',
      'oauth': 'ソーシャルログインの設定に問題があります。しばらく時間をおいて再試行してください。',
      'configuration': '認証システムの設定に問題があります。運営にお問い合わせください。',
      'default': 'ログイン処理でエラーが発生しました。ページを再読み込みして再試行してください。'
    };

    for (const [key, suggestion] of Object.entries(suggestions)) {
      if (error.toLowerCase().includes(key)) {
        return suggestion;
      }
    }

    return suggestions.default;
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent('ログインエラーのお問い合わせ');
    const body = encodeURIComponent(`
NeedPortへのログインでエラーが発生しました。

エラー内容: ${error || '不明'}
発生時刻: ${new Date().toLocaleString('ja-JP')}
URL: ${window.location.href}
ブラウザ: ${navigator.userAgent}

${diagnostics ? `
診断情報:
- Clerk読み込み: ${diagnostics.clerkLoaded ? '成功' : '失敗'}
- 公開キー設定: ${diagnostics.publishableKey ? 'あり' : 'なし'}
- 検出されたエラー: ${diagnostics.errors.join(', ') || 'なし'}
` : ''}

詳細な状況をお聞かせください：
`);

    window.open(`mailto:support@needport.jp?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>

          {/* Main Error Message */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ログインできませんでした
            </h2>
            
            <p className="text-gray-600 mb-6">
              認証システムにアクセスできません。<br />
              しばらく時間をおいて再試行するか、運営にお問い合わせください。
            </p>

            {/* Error Details */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <InformationCircleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="ml-3 text-left">
                    <h3 className="text-sm font-medium text-red-800">
                      エラー詳細
                    </h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                    {getErrorSuggestion(error) && (
                      <p className="mt-2 text-sm text-red-600">
                        💡 {getErrorSuggestion(error)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  再試行
                </button>
              )}

              <button
                onClick={() => window.location.reload()}
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ページを再読み込み
              </button>

              <button
                onClick={handleContactSupport}
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                運営にお問い合わせ
              </button>
            </div>

            {/* Diagnostic Information */}
            {showDiagnostics && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {showDetails ? '診断情報を隠す' : '診断情報を表示'}
                </button>

                {showDetails && diagnostics && (
                  <div className="mt-3 bg-gray-50 rounded-md p-3 text-left">
                    <h4 className="text-xs font-medium text-gray-900 mb-2">診断情報</h4>
                    <dl className="text-xs space-y-1">
                      <div>
                        <dt className="inline font-medium text-gray-600">Clerk読み込み:</dt>
                        <dd className="inline ml-2 text-gray-900">
                          {diagnostics.clerkLoaded ? '✅ 成功' : '❌ 失敗'}
                        </dd>
                      </div>
                      <div>
                        <dt className="inline font-medium text-gray-600">公開キー:</dt>
                        <dd className="inline ml-2 text-gray-900">
                          {diagnostics.publishableKey ? '✅ 設定済み' : '❌ 未設定'}
                        </dd>
                      </div>
                      <div>
                        <dt className="inline font-medium text-gray-600">現在のURL:</dt>
                        <dd className="inline ml-2 text-gray-900 break-all">
                          {diagnostics.currentUrl}
                        </dd>
                      </div>
                      {diagnostics.errors.length > 0 && (
                        <div>
                          <dt className="font-medium text-gray-600">検出されたエラー:</dt>
                          <dd className="text-gray-900 mt-1">
                            {diagnostics.errors.map((err, index) => (
                              <div key={index} className="bg-red-50 p-2 rounded text-xs mt-1">
                                {err}
                              </div>
                            ))}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}
              </div>
            )}

            {/* Alternative Actions */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3">
                ログインできない場合の代替手段
              </p>
              <div className="space-y-2">
                <a
                  href="/"
                  className="block text-sm text-blue-600 hover:text-blue-500"
                >
                  ← トップページに戻る
                </a>
                <a
                  href="/needs"
                  className="block text-sm text-blue-600 hover:text-blue-500"
                >
                  ニーズ一覧を見る（ログイン不要）
                </a>
                <a
                  href="/vendors"
                  className="block text-sm text-blue-600 hover:text-blue-500"
                >
                  事業者一覧を見る（ログイン不要）
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          継続的にエラーが発生する場合は、ブラウザのキャッシュをクリアするか、<br />
          異なるブラウザでお試しください。
        </p>
      </div>
    </div>
  );
}