'use client';

import { useState } from 'react';

export default function DevToolsPage() {
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const response = await fetch('/dev/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setSeedResult(result);
    } catch (error) {
      console.error('Seed error:', error);
      setSeedResult({ error: 'Failed to seed data' });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">開発ツール</h1>
      
      <div className="space-y-6">
        <div className="bg-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">データシード</h2>
          <p className="text-gray-400 mb-4">
            デモ用のダミーデータを生成します。ニーズ、オファー、プレジョインが作成されます。
          </p>
          
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {seeding ? 'シード中...' : 'ダミーデータを生成'}
          </button>

          {seedResult && (
            <div className="mt-4 p-4 bg-zinc-700 rounded">
              {seedResult.error ? (
                <div className="text-red-400">
                  エラー: {seedResult.error}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="font-medium">シード完了:</div>
                  <div>• ニーズ: {seedResult.summary.needs}件</div>
                  <div>• オファー: {seedResult.summary.offers}件</div>
                  <div>• プレジョイン: {seedResult.summary.prejoins}件</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">便利なリンク</h2>
          <div className="space-y-2">
            <a
              href="/"
              className="block text-emerald-400 hover:text-emerald-300 underline"
            >
              ホームページ
            </a>
            <a
              href="/admin"
              className="block text-emerald-400 hover:text-emerald-300 underline"
            >
              管理画面
            </a>
            <a
              href="/dev/checklist"
              className="block text-emerald-400 hover:text-emerald-300 underline"
            >
              デプロイチェックリスト
            </a>
            <a
              href="/api/csp/report"
              className="block text-emerald-400 hover:text-emerald-300 underline"
            >
              CSP違反レポート
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
