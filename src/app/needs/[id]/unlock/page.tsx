// src/app/needs/[id]/unlock/page.tsx
"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { useState } from "react";

/**
 * Need Unlock (PII Access) Page - Lv1 Implementation
 * 
 * Lv1 Policy: Operator-led refunds only
 * - 10% deposit required for contact information access
 * - Manual refund processing by operators
 * - No automatic refund after 30 days
 */

// Client component - cannot export metadata
// export const metadata: Metadata = {
//   title: "連絡先解放（10%デポジット）| NeedPort",
//   description: "事業者向け連絡先情報解放ページ（Lv1: 運営主導返金）",
// };

// Deposit button component
function DepositButton({ 
  needId, 
  estimateAmount, 
  depositAmount 
}: { 
  needId: string;
  estimateAmount: number;
  depositAmount: number;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/checkout/need-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          needId,
          estimateAmount,
        })
      });

      const data = await response.json();

      if (response.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(`決済エラー: ${data.error || 'Unknown error'}`);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('決済処理中にエラーが発生しました。');
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`w-full px-4 py-3 rounded font-semibold ${
        isLoading 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-sky-600 hover:bg-sky-700'
      } text-white`}
      onClick={handlePayment}
      disabled={isLoading}
    >
      {isLoading 
        ? '決済画面へ移動中...' 
        : `¥${depositAmount.toLocaleString()} のデポジットを支払う`
      }
    </button>
  );
}

export default function NeedUnlockPage({ params }: { params: { id: string } }) {
  const needId = params.id;
  
  // Mock data - TODO: Replace with actual API call
  const mockEstimate = 500000;
  const depositRate = parseFloat(process.env.NP_DEPOSIT_RATE || '0.10');
  const depositAmount = Math.floor(mockEstimate * depositRate);

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <div className="space-y-2">
        <Link href={`/needs/${needId}`} className="text-sky-700 underline text-sm">
          ← ニーズ詳細に戻る
        </Link>
        <h1 className="text-2xl font-bold">連絡先情報の解放</h1>
      </div>

      {/* デポジット説明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="font-semibold text-blue-900 mb-2">💰 デポジット決済（Lv1方式）</h2>
        <div className="text-blue-800 space-y-1 text-sm">
          <p>• <strong>金額:</strong> ¥{depositAmount.toLocaleString()} （見積額の{Math.round(depositRate * 100)}%）</p>
          <p>• <strong>決済:</strong> Stripe安全決済</p>
          <p>• <strong>成約時:</strong> デポジットは成功報酬に充当</p>
        </div>
      </div>

      {/* Lv1ポリシー重要事項 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">⚠️ 返金ポリシー（Lv1）</h3>
        <div className="text-yellow-800 text-sm space-y-1">
          <p>• <strong>返金方式:</strong> 運営による手動審査・承認</p>
          <p>• <strong>自動返金:</strong> 行われません</p>
          <p>• <strong>不成立時:</strong> 運営判断で返金処理</p>
          <p>• <strong>24時間ルール:</strong> 連絡不可の場合は返金対象</p>
        </div>
      </div>

      {/* 決済ボタン */}
      <div className="bg-white border rounded-lg p-4 space-y-3">
        <p className="text-slate-700">
          デポジット決済完了後、連絡先情報が解放されます。
        </p>
        <DepositButton 
          needId={needId}
          estimateAmount={mockEstimate}
          depositAmount={depositAmount}
        />
        <p className="text-xs text-slate-500 text-center">
          ✓ Stripeによる安全な決済処理  ✓ 運営確認後の手動返金対応
        </p>
      </div>

      <div className="text-center">
        <Link href={`/needs/${needId}`} className="text-slate-600 hover:text-slate-800 text-sm">
          キャンセルして戻る
        </Link>
      </div>
    </div>
  );
}
