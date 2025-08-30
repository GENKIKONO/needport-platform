'use client';

import { useEffect, useState } from 'react';
import { events } from '@/lib/events';

interface Offer {
  id: string;
  title: string;
  status: 'pending' | 'accepted' | 'rejected';
  amount: number;
  createdAt: string;
  needTitle: string;
}

export default function OffersTable({ userId }: { userId: string }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: 実際のAPIエンドポイントに置き換え
        // const response = await fetch('/api/me/offers');
        // if (!response.ok) {
        //   throw new Error('Failed to fetch offers');
        // }
        // const data = await response.json();
        
        // モックデータ
        await new Promise(resolve => setTimeout(resolve, 100));
        const mockOffers: Offer[] = [
          {
            id: 'O-001',
            title: 'Webサイト制作提案',
            status: 'pending',
            amount: 150000,
            createdAt: '2024-01-15T10:30:00Z',
            needTitle: '企業サイトのリニューアル'
          },
          {
            id: 'O-002',
            title: 'ロゴデザイン提案',
            status: 'accepted',
            amount: 80000,
            createdAt: '2024-01-10T14:20:00Z',
            needTitle: '新ブランドロゴ制作'
          },
          {
            id: 'O-003',
            title: 'アプリ開発提案',
            status: 'rejected',
            amount: 500000,
            createdAt: '2024-01-05T09:15:00Z',
            needTitle: 'モバイルアプリ開発'
          }
        ];
        setOffers(mockOffers);
      } catch (err) {
        console.error('Failed to fetch offers:', err);
        setError('提案の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [userId]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '審査中';
      case 'accepted': return '採用';
      case 'rejected': return '不採用';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleRetry = () => {
    events.track('me.retry', { target: 'offers' });
    window.location.reload();
  };

  if (loading) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-3">提案管理</h2>
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
        <h2 className="text-lg font-semibold mb-3">提案管理</h2>
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

  if (offers.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-3">提案管理</h2>
        <div className="rounded-md border bg-white p-4 text-center text-gray-500">
          提案はまだありません
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">提案管理</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                案件
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                提案内容
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                金額
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状態
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                提出日
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {offers.map((offer) => (
              <tr key={offer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {offer.needTitle}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {offer.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ¥{offer.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(offer.status)}`}>
                    {getStatusText(offer.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(offer.createdAt).toLocaleDateString('ja-JP')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
