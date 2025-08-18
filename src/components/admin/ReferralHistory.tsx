'use client';

import { useEffect, useState } from 'react';

type ReferralHistoryItem = {
  id: string;
  token: string;
  issuer: string;
  status: 'active' | 'used' | 'expired';
  createdAt: string;
  usedAt?: string;
  usedBy?: string;
};

export default function ReferralHistory({ needId }: { needId: string }) {
  const [history, setHistory] = useState<ReferralHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`/api/admin/referrals?needId=${needId}&limit=20`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data.items || []);
        }
      } catch (error) {
        console.error('Failed to load referral history:', error);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [needId]);

  const copyToClipboard = async (token: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/ref/${token}`);
      // トースト通知
      window.dispatchEvent(new CustomEvent("toast", { 
        detail: { type: "success", message: "紹介リンクをコピーしました" }
      }));
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">読み込み中...</div>;
  }

  if (history.length === 0) {
    return <div className="text-sm text-gray-500">紹介履歴はありません</div>;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900">紹介履歴（最新20件）</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {history.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-gray-600 truncate">{item.token.slice(0, 8)}...</span>
                <span className={`px-1 py-0.5 rounded text-xs ${
                  item.status === 'active' ? 'bg-green-100 text-green-800' :
                  item.status === 'used' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.status === 'active' ? '有効' : item.status === 'used' ? '使用済み' : '期限切れ'}
                </span>
              </div>
              <div className="text-gray-500">
                {new Date(item.createdAt).toLocaleDateString('ja-JP')}
                {item.usedAt && ` • 使用: ${new Date(item.usedAt).toLocaleDateString('ja-JP')}`}
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(item.token)}
              className="ml-2 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              コピー
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
