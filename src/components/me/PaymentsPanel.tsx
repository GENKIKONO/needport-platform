'use client';

import { useEffect, useState } from 'react';
import { Payment } from '@/lib/types/me';
import { events } from '@/lib/events';
import Section from './Section';

const methodConfig = {
  card: { label: 'クレジットカード', icon: '💳' },
  bank: { label: '銀行振込', icon: '🏦' }
};

const statusConfig = {
  pending: { label: '支払い待ち', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: '支払い完了', color: 'bg-green-100 text-green-800' },
  failed: { label: '支払い失敗', color: 'bg-red-100 text-red-800' }
};

export default function PaymentsPanel({ userId }: { userId: string }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/me/payments');
        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }
        const data = await response.json();
        setPayments(data);
      } catch (err) {
        console.error('Failed to fetch payments:', err);
        setError('読み込みエラー');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [userId]);

  const handleRetry = () => {
    events.track('me.retry', { target: 'payments' });
    window.location.reload();
  };

  if (loading) {
    return (
      <Section title="支払い状況" description="取引に関連する支払い情報">
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </Section>
    );
  }

  if (error) {
    return (
      <Section title="支払い状況" description="取引に関連する支払い情報">
        <div className="text-center py-8">
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            再読込
          </button>
        </div>
      </Section>
    );
  }

  return (
    <Section title="支払い状況" description="取引に関連する支払い情報">
      <div className="space-y-4">
        {payments.map((payment) => {
          const method = methodConfig[payment.method];
          const status = statusConfig[payment.status];
          
          return (
            <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{method.label}</h3>
                    <p className="text-sm text-gray-600">{payment.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    ¥{payment.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(payment.issuedAt).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                  {status.label}
                </span>
                
                {payment.method === 'card' && payment.status === 'pending' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>カード決済は準備中です</strong><br />
                      銀行振込でのお支払いをお願いします
                    </p>
                  </div>
                )}
                
                {payment.method === 'bank' && payment.status === 'pending' && (
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                    振込先情報を表示
                  </button>
                )}
              </div>
            </div>
          );
        })}
        
        {payments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>支払い情報はありません</p>
          </div>
        )}
      </div>
    </Section>
  );
}
