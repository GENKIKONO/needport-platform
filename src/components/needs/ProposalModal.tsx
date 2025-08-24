'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { XMarkIcon } from '@heroicons/react/24/outline';

const schema = z.object({
  amount: z.number().min(1000, '金額は1,000円以上で入力してください'),
  message: z.string().min(10, 'メッセージは10文字以上で入力してください').max(1000, 'メッセージは1000文字以内で入力してください'),
});

type FormValues = z.infer<typeof schema>;

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  needId: string;
  needTitle: string;
}

export default function ProposalModal({ isOpen, onClose, needId, needTitle }: ProposalModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      // ダミーAPI送信（200返すだけ）
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          needId,
          ...values,
        }),
      });
      
      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
          setSubmitted(false);
        }, 2000);
      } else {
        throw new Error('提案の送信に失敗しました');
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert('提案の送信に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">提案を送信</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">提案を送信しました</h3>
            <p className="text-gray-600">投稿者からの返答をお待ちください</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">提案対象:</p>
              <p className="font-medium text-gray-900">{needTitle}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  提案金額 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="amount"
                    {...register('amount', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10000"
                    min="1000"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 text-sm">円</span>
                  </div>
                </div>
                {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  提案メッセージ <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  rows={6}
                  {...register('message')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="提案内容や実現方法について詳しく説明してください..."
                />
                {errors.message && <p className="text-sm text-red-600 mt-1">{errors.message.message}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={!isValid || submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? '送信中…' : '提案を送信'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
