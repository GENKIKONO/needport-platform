'use client';

import { useState } from 'react';
import { getDevSession } from '@/lib/devAuth';

interface ApplicationModalProps {
  needId: string;
  needTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplicationModal({ 
  needId, 
  needTitle, 
  isOpen, 
  onClose, 
  onSuccess 
}: ApplicationModalProps) {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const devSession = getDevSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/rooms/${needId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '申請に失敗しました');
      }

      onSuccess();
      onClose();
      setNote('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">チャット入室申請</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            <strong>{needTitle}</strong> へのチャット入室を申請します
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <h3 className="font-medium text-blue-900 mb-2">申請前にご確認ください</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• プロフィール情報が適切に設定されていること</li>
              <li>• 真剣な相談・提案の目的であること</li>
              <li>• スパム・荒らし行為を行わないこと</li>
              <li>• 承認まで数日かかる場合があります</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
              申請理由・メッセージ（任意）
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="申請理由や相談したい内容を記入してください"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {note.length}/500文字
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? '申請中...' : '申請する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
