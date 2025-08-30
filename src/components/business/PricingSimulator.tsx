'use client';

import { useState } from 'react';
import { computeMatchingFee, PaymentMethod } from '@/lib/fees';
import { events } from '@/lib/events';

interface PricingResult {
  total: number;
  method: PaymentMethod;
  rate: number;
  fee: number;
  referralBuf: number;
  stripeCost: number;
  bandLabel: string;
}

export default function PricingSimulator() {
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>('bank');
  const [result, setResult] = useState<PricingResult | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(true);

  const calculatePricing = (): PricingResult | null => {
    if (quantity <= 0 || unitPrice <= 0) {
      return null;
    }

    const calculation = computeMatchingFee({ quantity, unitPrice, method });
    
    // 金額帯ラベルを決定
    let bandLabel = '';
    if (calculation.total <= 100_000) {
      bandLabel = '〜¥100,000';
    } else if (calculation.total <= 500_000) {
      bandLabel = '¥100,000〜500,000';
    } else {
      bandLabel = '¥500,000以上';
    }

    return {
      total: calculation.total,
      method: calculation.method,
      rate: calculation.rate,
      fee: calculation.fee,
      referralBuf: calculation.referralBuf,
      stripeCost: calculation.stripeCost,
      bandLabel
    };
  };

  const handleCalculate = () => {
    const calculatedResult = calculatePricing();
    setResult(calculatedResult);
    
    if (calculatedResult) {
      // イベント追跡
      events.kaichuFilter('dev-user-123', {
        type: 'pricing.simulate',
        quantity,
        unitPrice,
        method,
        rate: calculatedResult.rate,
        fee: calculatedResult.fee
      });
    }
  };

  const formatJPY = (amount: number): string => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRatePercentage = (rate: number): string => {
    return `${Math.round(rate * 100)}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">マッチングフィー計算</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            人数
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="3"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            単価（円）
          </label>
          <input
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="30000"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            支払方法
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="bank"
                checked={method === 'bank'}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="mr-2"
              />
              <span className="text-sm">
                銀行振込（推奨）：大きな案件ほどお得（〜¥100,000:9% / 〜¥500,000:8% / それ以上:7%）
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="card"
                checked={method === 'card'}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="mr-2"
              />
              <span className="text-sm">
                カード決済：手軽さ優先（〜¥100,000:10% / 〜¥500,000:9% / それ以上:8%）
              </span>
            </label>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          計算する
        </button>
      </div>

      {result && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-semibold text-gray-900">計算結果</h4>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {result.bandLabel}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">案件金額（税別）:</span>
              <span className="font-semibold text-lg text-blue-600">
                {formatJPY(result.total)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">マッチングフィー（{getRatePercentage(result.rate)}）:</span>
              <span className="font-medium text-red-600">
                {formatJPY(result.fee)}
              </span>
            </div>
          </div>

          {result.total >= 100_000 && method === 'card' && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
              💡 銀行振込にすると手数料が安くなります
            </div>
          )}

          {showDetails && (
            <div className="mt-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-600 hover:text-blue-800 mb-2"
              >
                {showDetails ? '詳細を隠す' : '詳細を表示'}
              </button>
              
              {showDetails && (
                <div className="p-3 bg-gray-100 rounded text-sm text-gray-700 space-y-2">
                  <div className="flex justify-between">
                    <span>紹介還元バッファ（参考）:</span>
                    <span>{formatJPY(result.referralBuf)}</span>
                  </div>
                  {result.stripeCost > 0 && (
                    <div className="flex justify-between">
                      <span>Stripe決済原価（参考）:</span>
                      <span>{formatJPY(result.stripeCost)}</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-600 mt-2">
                    <p>• 紹介還元（将来機能）の原資として一部バッファを確保しています。</p>
                    {result.stripeCost > 0 && (
                      <p>• カード決済の場合、プラットフォーム側の決済原価（Stripe 3.6%）が発生します（事業者への請求額には含みません）。</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!result && quantity > 0 && unitPrice > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 rounded text-sm text-yellow-800">
          計算ボタンを押してください
        </div>
      )}
    </div>
  );
}
