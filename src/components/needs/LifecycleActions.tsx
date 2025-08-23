'use client';

import { useState } from 'react';
import { NeedStatus } from '@/lib/needs/lifecycle';

interface LifecycleActionsProps {
  needId: string;
  status: NeedStatus;
  onSuccess: () => void;
  className?: string;
}

export default function LifecycleActions({ 
  needId, 
  status, 
  onSuccess, 
  className = '' 
}: LifecycleActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeReason, setCloseReason] = useState('');

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/needs/${needId}/continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('継続に失敗しました');
      }

      onSuccess();
      setShowContinueModal(false);
      // トースト通知（簡易実装）
      alert('ニーズを継続しました');
    } catch (error) {
      console.error('Error continuing need:', error);
      alert('継続に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/needs/${needId}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: closeReason }),
      });

      if (!response.ok) {
        throw new Error('完了に失敗しました');
      }

      onSuccess();
      setShowCloseModal(false);
      setCloseReason('');
      // トースト通知（簡易実装）
      alert('ニーズを完了しました');
    } catch (error) {
      console.error('Error closing need:', error);
      alert('完了に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: NeedStatus) => {
    const statusConfig = {
      active: { label: 'アクティブ', className: 'bg-green-100 text-green-800' },
      closed: { label: '完了', className: 'bg-gray-100 text-gray-800' },
      archived: { label: '保管', className: 'bg-blue-100 text-blue-800' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className={className}>
      {/* ステータスバッジ */}
      <div className="mb-3">
        {getStatusBadge(status)}
      </div>

      {/* 操作ボタン */}
      {status === 'active' && (
        <div className="flex gap-2">
          <button
            onClick={() => setShowContinueModal(true)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
          >
            継続する
          </button>
          <button
            onClick={() => setShowCloseModal(true)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50"
          >
            完了する
          </button>
        </div>
      )}

      {/* 継続確認モーダル */}
      {showContinueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ニーズを継続</h3>
            <p className="text-gray-600 mb-6">
              このニーズを継続扱いにします。よろしいですか？
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowContinueModal(false)}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                キャンセル
              </button>
              <button
                onClick={handleContinue}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? '処理中...' : '継続する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 完了確認モーダル */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ニーズを完了</h3>
            <p className="text-gray-600 mb-4">
              このニーズを完了にします。公開一覧から外れ、海中に移ります。
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                完了メモ（任意）
              </label>
              <textarea
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="完了理由や結果を記入してください"
                maxLength={500}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCloseModal(false)}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                キャンセル
              </button>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? '処理中...' : '完了する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
