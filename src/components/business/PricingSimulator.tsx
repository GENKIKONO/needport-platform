'use client';

import { useState } from 'react';

interface PricingResult {
  suggestedPrice: number;
  feeAmount: number;
  netAmount: number;
  feeRate: number;
}

export default function PricingSimulator() {
  const [cost, setCost] = useState<number>(0);
  const [profit, setProfit] = useState<number>(0);
  const [feeRate, setFeeRate] = useState<number>(10);
  const [result, setResult] = useState<PricingResult | null>(null);

  const calculatePricing = (): PricingResult => {
    if (cost <= 0 || profit <= 0 || feeRate <= 0 || feeRate >= 100) {
      return {
        suggestedPrice: 0,
        feeAmount: 0,
        netAmount: 0,
        feeRate: feeRate
      };
    }

    // 式: price = (cost + profit) / (1 - feeRate/100)
    const suggestedPrice = Math.round((cost + profit) / (1 - feeRate / 100));
    const feeAmount = Math.round(suggestedPrice * (feeRate / 100));
    const netAmount = suggestedPrice - feeAmount;

    return {
      suggestedPrice,
      feeAmount,
      netAmount,
      feeRate
    };
  };

  const handleCalculate = () => {
    const calculatedResult = calculatePricing();
    setResult(calculatedResult);
  };

  const formatJPY = (amount: number): string => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">料金シミュレーター</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            原価（円）
          </label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="200000"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            希望利益（円）
          </label>
          <input
            type="number"
            value={profit}
            onChange={(e) => setProfit(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="300000"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            手数料率（%）
          </label>
          <input
            type="number"
            value={feeRate}
            onChange={(e) => setFeeRate(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="10"
            min="0"
            max="99"
            step="0.1"
          />
        </div>

        <button
          onClick={handleCalculate}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          計算する
        </button>
      </div>

      {result && result.suggestedPrice > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 mb-3">計算結果</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">推奨提示額:</span>
              <span className="font-semibold text-lg text-blue-600">
                {formatJPY(result.suggestedPrice)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">手数料（{result.feeRate}%）:</span>
              <span className="font-medium text-red-600">
                {formatJPY(result.feeAmount)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">取り分:</span>
              <span className="font-medium text-green-600">
                {formatJPY(result.netAmount)}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-100 rounded text-sm text-gray-700">
            <p className="font-medium mb-1">計算式:</p>
            <p>提示額 = (原価 + 利益) ÷ (1 - 手数料率/100)</p>
            <p className="mt-1">
              {formatJPY(cost)} + {formatJPY(profit)} ÷ (1 - {feeRate}%) = {formatJPY(result.suggestedPrice)}
            </p>
          </div>
        </div>
      )}

      {result && result.suggestedPrice === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 rounded text-sm text-yellow-800">
          有効な値を入力してください（原価、利益は0より大きく、手数料率は0-99%の範囲）
        </div>
      )}
    </div>
  );
}
