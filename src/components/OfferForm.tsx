"use client";
import { useState } from 'react';

interface OfferFormProps {
  needId: string;
  onSuccess?: () => void;
}

export default function OfferForm({ needId, onSuccess }: OfferFormProps) {
  const [priceYen, setPriceYen] = useState('');
  const [memo, setMemo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!priceYen.trim() && !memo.trim()) {
      alert('金額またはメモを入力してください');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          need_id: needId,
          price_yen: priceYen ? parseInt(priceYen) : null,
          memo: memo.trim() || null,
        }),
      });

      if (response.status === 201) {
        alert('提案を送信しました！');
        setPriceYen('');
        setMemo('');
        onSuccess?.();
      } else if (response.status === 501) {
        alert('本番DB接続時のみ提案可能です（環境変数を設定してください）');
      } else {
        alert('提案エラー');
      }
    } catch (error) {
      alert('提案エラー');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
          金額（円）
        </label>
        <input
          type="number"
          id="price"
          value={priceYen}
          onChange={(e) => setPriceYen(e.target.value)}
          placeholder="例: 50000"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">
          メモ
        </label>
        <textarea
          id="memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="提案の詳細や条件を記入してください"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary w-full"
      >
        {submitting ? '送信中...' : '提案を送信'}
      </button>
    </form>
  );
}
