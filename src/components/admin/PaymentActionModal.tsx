"use client";

import { useState } from "react";

interface HeldTransaction {
  id: string;
  amount: number;
  vendor_id: string;
  need_id: string;
  proposal_id: string;
  stripe_payment_intent_id: string;
  created_at: string;
  vendor_name?: string;
  need_title?: string;
  status: 'held' | 'completed' | 'refunded';
}

interface PaymentActionModalProps {
  transaction: HeldTransaction;
  actionType: 'release' | 'refund';
  onClose: () => void;
  onComplete: () => void;
}

export function PaymentActionModal({ transaction, actionType, onClose, onComplete }: PaymentActionModalProps) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isRelease = actionType === 'release';
  const title = isRelease ? '決済解放' : '返金処理';
  const buttonColor = isRelease ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';
  
  const reasonOptions = isRelease ? [
    'service_completed',
    'contact_accessed', 
    'agreement_reached',
    'operator_approval'
  ] : [
    'service_not_provided',
    'contact_unreachable', 
    'agreement_failed',
    'dispute_resolution',
    'operator_decision'
  ];

  const reasonLabels: Record<string, string> = {
    // Release reasons
    'service_completed': 'サービス完了',
    'contact_accessed': '連絡先アクセス済み',
    'agreement_reached': '合意成立',
    'operator_approval': '運営承認',
    // Refund reasons
    'service_not_provided': 'サービス提供なし',
    'contact_unreachable': '連絡先不通',
    'agreement_failed': '合意不成立',
    'dispute_resolution': '争議解決',
    'operator_decision': '運営判断'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      setError('理由を選択してください');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const endpoint = isRelease ? '/api/admin/payments/release' : '/api/admin/payments/refund';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: transaction.id,
          reason,
          notes: notes.trim() || undefined,
          amount: transaction.amount,
          stripePaymentIntentId: transaction.stripe_payment_intent_id
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `${title}に失敗しました`);
      }

      setSuccess(true);
      
      // Show success message briefly before closing
      setTimeout(() => {
        onComplete();
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : `${title}に失敗しました`);
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-green-600 text-4xl mb-4">✓</div>
            <h3 className="text-lg font-semibold text-green-800">
              {title}が完了しました
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              取引 {transaction.id.slice(0, 8)}... の処理が正常に完了しました
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {title} - 運営確認
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            disabled={processing}
          >
            ✕
          </button>
        </div>

        {/* Transaction Details */}
        <div className="bg-slate-50 rounded-lg p-4 mb-4 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">取引ID:</span> {transaction.id.slice(0, 8)}...
            </div>
            <div>
              <span className="font-medium">金額:</span> ¥{transaction.amount.toLocaleString()}
            </div>
            <div className="col-span-2">
              <span className="font-medium">ニーズ:</span> {transaction.need_title || 'N/A'}
            </div>
            <div className="col-span-2">
              <span className="font-medium">事業者:</span> {transaction.vendor_name || 'N/A'}
            </div>
          </div>
        </div>

        {/* Lv1 Policy Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <div className="text-amber-800 text-sm">
            <div className="font-semibold mb-1">⚠️ Lv1ポリシー</div>
            <p>
              この操作は<strong>運営判断による手動処理</strong>です。
              {isRelease ? '解放後は取引が完了し、事業者に資金が移転されます。' : '返金後は資金が元の決済手段に戻ります。'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {title}理由 <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
              disabled={processing}
            >
              <option value="">理由を選択してください</option>
              {reasonOptions.map(option => (
                <option key={option} value={option}>
                  {reasonLabels[option]}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              備考 (任意)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="追加の詳細や特記事項があれば記載してください"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              disabled={processing}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-red-800 text-sm">
                <strong>エラー:</strong> {error}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
              disabled={processing}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-sm text-white rounded-md ${buttonColor} disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={processing || !reason}
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  処理中...
                </span>
              ) : (
                `${title}を実行`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}