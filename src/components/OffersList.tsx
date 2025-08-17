"use client";
import { useState, useEffect } from 'react';

interface Offer {
  id: string;
  provider_handle: string;
  price_yen?: number;
  memo?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

interface OffersListProps {
  needId: string;
  isOwner?: boolean;
}

export default function OffersList({ needId, isOwner = false }: OffersListProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    fetchOffers();
  }, [needId]);

  const fetchOffers = async () => {
    try {
      const response = await fetch(`/api/offers?need_id=${needId}`);
      if (response.ok) {
        const data = await response.json();
        setOffers(data);
      }
    } catch (error) {
      console.error('Failed to fetch offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offerId: string) => {
    if (!confirm('この提案を承認してルームを作成しますか？')) return;
    
    setAccepting(offerId);
    try {
      const response = await fetch(`/api/offers/${offerId}/accept`, {
        method: 'POST'
      });
      
      if (response.status === 201) {
        const { room_id } = await response.json();
        alert('ルームを作成しました！');
        window.location.href = `/rooms/${room_id}`;
      } else if (response.status === 501) {
        alert('本番DB接続時のみ承認可能です（環境変数を設定してください）');
      } else if (response.status === 403) {
        alert('この提案を承認する権限がありません');
      } else {
        alert('承認エラー');
      }
    } catch (error) {
      alert('承認エラー');
    } finally {
      setAccepting(null);
    }
  };

  if (loading) {
    return (
      <div className="np-card p-6">
        <h3 className="font-semibold mb-4">提案一覧</h3>
        <div className="text-center text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="np-card p-6">
        <h3 className="font-semibold mb-4">提案一覧</h3>
        <div className="text-center text-gray-500">まだ提案はありません</div>
      </div>
    );
  }

  return (
    <div className="np-card p-6">
      <h3 className="font-semibold mb-4">提案一覧 ({offers.length}件)</h3>
      <div className="space-y-4">
        {offers.map(offer => (
          <div key={offer.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium">
                  {offer.provider_handle}
                  {offer.status === 'accepted' && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      承認済み
                    </span>
                  )}
                </div>
                {offer.price_yen && (
                  <div className="text-sm text-gray-600">
                    金額: ¥{offer.price_yen.toLocaleString()}
                  </div>
                )}
              </div>
              {isOwner && offer.status === 'pending' && (
                <button
                  onClick={() => handleAccept(offer.id)}
                  disabled={accepting === offer.id}
                  className="btn btn-primary text-sm"
                >
                  {accepting === offer.id ? '承認中...' : '承認'}
                </button>
              )}
            </div>
            {offer.memo && (
              <div className="text-sm text-gray-700 mt-2">
                {offer.memo}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-2">
              {new Date(offer.created_at).toLocaleString('ja-JP')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
