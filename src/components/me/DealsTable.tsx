'use client';

import { useEffect, useState } from 'react';
import { Deal } from '@/lib/types/me';
import { events } from '@/lib/events';

export default function DealsTable({ userId }: { userId: string }) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/me/deals');
        if (!response.ok) {
          throw new Error('Failed to fetch deals');
        }
        const data = await response.json();
        setDeals(data);
      } catch (err) {
        console.error('Failed to fetch deals:', err);
        setError('読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [userId]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'progress': return '進行中';
      case 'done': return '成立';
      case 'canceled': return 'キャンセル';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-emerald-100 text-emerald-700';
      case 'progress': return 'bg-blue-100 text-blue-700';
      case 'canceled': return 'bg-slate-200 text-slate-600';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleRetry = () => {
    events.track('me.retry', { target: 'deals' });
    window.location.reload();
  };

  if (loading) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-3">成約案件一覧</h2>
        <div className="rounded-md border bg-white p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-3">成約案件一覧</h2>
        <div className="rounded-md border bg-white p-4 text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            再読込
          </button>
        </div>
      </section>
    );
  }

  if (deals.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-3">成約案件一覧</h2>
        <div className="rounded-md border bg-white p-4 text-center text-gray-500">
          成約案件はまだありません
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">成約案件一覧</h2>
      <div className="divide-y rounded-md border bg-white">
        {deals.map(deal => (
          <div key={deal.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{deal.title}</div>
              {deal.counterpart && (
                <div className="text-sm text-gray-500">{deal.counterpart}</div>
              )}
            </div>
            <span className={`px-2 py-1 rounded ${getStatusColor(deal.status)}`}>
              {getStatusText(deal.status)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
