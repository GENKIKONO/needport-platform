'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generalProfileSchema } from '@/lib/validation/onboarding';
import { getDevSession } from '@/lib/devAuth';
import { u } from '@/components/ui/u';

interface FormStep {
  title: string;
  description: string;
}

const STEPS: FormStep[] = [
  { title: '基本情報', description: '表示名、居住地、自己紹介を入力' },
  { title: '通知設定', description: 'メール通知の設定' },
  { title: '同意', description: '利用規約に同意' }
];

export default function GeneralAuthPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    displayName: '',
    city: '',
    intro: '',
    notifyEmail: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const devSession = getDevSession();

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setErrors({});
  };

  const validateStep = (step: number): boolean => {
    const stepValidations = [
      // Step 0: 基本情報
      () => {
        if (!formData.displayName || formData.displayName.length < 2) {
          setErrors({ displayName: '表示名は2文字以上で入力してください' });
          return false;
        }
        return true;
      },
      // Step 1: 通知設定（任意）
      () => true,
      // Step 2: 同意
      () => {
        // 同意は最後のステップでチェック
        return true;
      }
    ];

    return stepValidations[step]?.() ?? true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/profile/general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        setErrors(error.fields || { submit: error.message });
        return;
      }

      router.push('/me');
    } catch (error) {
      setErrors({ submit: '保存に失敗しました' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                表示名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => updateFormData({ displayName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md ${u.focus} ${
                  errors.displayName ? 'border-red-500' : 'border-[var(--c-border)]'
                }`}
                placeholder="例：田中太郎"
              />
              {errors.displayName && (
                <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                居住地
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => updateFormData({ city: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md ${u.focus} border-[var(--c-border)]`}
                placeholder="例：東京都渋谷区"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                自己紹介
              </label>
              <textarea
                value={formData.intro}
                onChange={(e) => updateFormData({ intro: e.target.value })}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md ${u.focus} border-[var(--c-border)]`}
                placeholder="自己紹介を入力してください（任意）"
              />
              <div className="text-xs text-[var(--c-text-muted)] mt-1">
                {(formData.intro?.length || 0)}/500
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.notifyEmail}
                  onChange={(e) => updateFormData({ notifyEmail: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-[var(--c-text)]">
                  メール通知を受け取る
                </span>
              </label>
              <p className="text-xs text-[var(--c-text-muted)] mt-1">
                新しいニーズやメッセージの通知をメールで受け取ります
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  required
                  className="mr-2 mt-1"
                />
                <div className="text-sm">
                  <span className="text-[var(--c-text)]">
                    <a href="/legal/terms" target="_blank" className="text-[var(--c-blue)] hover:underline">
                      利用規約
                    </a>、
                    <a href="/legal/privacy" target="_blank" className="text-[var(--c-blue)] hover:underline">
                      プライバシーポリシー
                    </a>、
                    <a href="/legal/tokusho" target="_blank" className="text-[var(--c-blue)] hover:underline">
                      特定商取引法
                    </a>
                    に同意します <span className="text-red-500">*</span>
                  </span>
                </div>
              </label>
            </div>

            {errors.submit && (
              <p className="text-red-500 text-sm">{errors.submit}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* ステッパー */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= currentStep 
                  ? 'bg-[var(--c-blue)] text-white' 
                  : 'bg-[var(--c-blue-bg)] text-[var(--c-blue-strong)]'
              }`}>
                {index + 1}
              </div>
              {index < STEPS.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  index < currentStep ? 'bg-[var(--c-blue)]' : 'bg-[var(--c-blue-bg)]'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <h2 className="text-lg font-semibold text-[var(--c-text)]">
            {STEPS[currentStep].title}
          </h2>
          <p className="text-sm text-[var(--c-text-muted)]">
            {STEPS[currentStep].description}
          </p>
        </div>
      </div>

      {/* フォーム */}
      <div className={`${u.card} ${u.cardPad}`}>
        {renderStep()}

        {/* ナビゲーション */}
        <div className="flex justify-between mt-8 pt-6 border-t border-[var(--c-border)]">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`${u.btn} ${u.btnGhost} ${u.focus}`}
          >
            戻る
          </button>

          <div className="flex gap-2">
            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className={`${u.btn} ${u.btnPrimary} ${u.focus}`}
              >
                次へ
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`${u.btn} ${u.btnPrimary} ${u.focus}`}
              >
                {isSubmitting ? '保存中...' : '保存する'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
