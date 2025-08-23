'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { vendorOnboardingSchema } from '@/lib/validation/onboarding';
import { uploadFile, validateFile, type FileKind } from '@/lib/storage';
import { getDevSession } from '@/lib/devAuth';
import { u } from '@/components/ui/u';

interface FormStep {
  title: string;
  description: string;
}

const STEPS: FormStep[] = [
  { title: '会社情報', description: '社名、URL、適格請求書' },
  { title: '提供範囲', description: '業種、対応エリア' },
  { title: '実績', description: 'ポートフォリオ、自己紹介' },
  { title: '提出書類', description: '会社概要、実績資料' },
  { title: '確認＆同意', description: '内容確認と規約同意' }
];

interface Attachment {
  kind: FileKind;
  key: string;
  name: string;
  size: number;
  url?: string;
}

export default function VendorAuthPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: '',
    companyKana: '',
    website: '',
    industries: [] as string[],
    serviceAreas: [] as string[],
    portfolioUrls: [] as string[],
    contactEmail: '',
    contactPhone: '',
    invoiceQualified: false,
    intro: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const devSession = getDevSession();

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setErrors({});
  };

  const validateStep = (step: number): boolean => {
    const stepValidations = [
      // Step 0: 会社情報
      () => {
        if (!formData.companyName || formData.companyName.length < 2) {
          setErrors({ companyName: '会社名は2文字以上で入力してください' });
          return false;
        }
        if (!formData.contactEmail) {
          setErrors({ contactEmail: '連絡先メールアドレスを入力してください' });
          return false;
        }
        return true;
      },
      // Step 1: 提供範囲（任意）
      () => true,
      // Step 2: 実績（任意）
      () => true,
      // Step 3: 提出書類（任意）
      () => true,
      // Step 4: 確認＆同意
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

  const handleFileUpload = async (file: File, kind: FileKind) => {
    const validation = validateFile(file, kind);
    if (!validation.valid) {
      setErrors({ documents: validation.error });
      return;
    }

    try {
      const result = await uploadFile(file, kind, devSession?.userId || 'dev-user');
      const attachment: Attachment = {
        kind,
        key: result.key,
        name: file.name,
        size: file.size,
        url: result.url
      };
      
      setAttachments(prev => [...prev, attachment]);
    } catch (error) {
      setErrors({ documents: error instanceof Error ? error.message : 'アップロードに失敗しました' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/profile/vendor', {
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
                会社名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => updateFormData({ companyName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md ${u.focus} ${
                  errors.companyName ? 'border-red-500' : 'border-[var(--c-border)]'
                }`}
                placeholder="例：株式会社サンプル"
              />
              {errors.companyName && (
                <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                会社名（カナ）
              </label>
              <input
                type="text"
                value={formData.companyKana}
                onChange={(e) => updateFormData({ companyKana: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md ${u.focus} border-[var(--c-border)]`}
                placeholder="例：カブシキガイシャサンプル"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                会社URL
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => updateFormData({ website: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md ${u.focus} border-[var(--c-border)]`}
                placeholder="例：https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                連絡先メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => updateFormData({ contactEmail: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md ${u.focus} ${
                  errors.contactEmail ? 'border-red-500' : 'border-[var(--c-border)]'
                }`}
                placeholder="例：contact@example.com"
              />
              {errors.contactEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                連絡先電話番号
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => updateFormData({ contactPhone: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md ${u.focus} border-[var(--c-border)]`}
                placeholder="例：03-1234-5678"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.invoiceQualified}
                  onChange={(e) => updateFormData({ invoiceQualified: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-[var(--c-text)]">
                  適格請求書発行事業者です
                </span>
              </label>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                業種（複数選択可）
              </label>
              <div className="space-y-2">
                {[
                  'IT・システム開発',
                  'デザイン・クリエイティブ',
                  'マーケティング',
                  '営業・販売',
                  'コンサルティング',
                  '製造・ものづくり',
                  'その他'
                ].map((industry) => (
                  <label key={industry} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.industries.includes(industry)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData({ industries: [...formData.industries, industry] });
                        } else {
                          updateFormData({ 
                            industries: formData.industries.filter(i => i !== industry) 
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-[var(--c-text)]">{industry}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                対応エリア（複数選択可）
              </label>
              <div className="space-y-2">
                {[
                  '東京',
                  '大阪',
                  '名古屋',
                  '福岡',
                  '札幌',
                  '仙台',
                  '広島',
                  '全国対応',
                  'その他'
                ].map((area) => (
                  <label key={area} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.serviceAreas.includes(area)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData({ serviceAreas: [...formData.serviceAreas, area] });
                        } else {
                          updateFormData({ 
                            serviceAreas: formData.serviceAreas.filter(a => a !== area) 
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-[var(--c-text)]">{area}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                ポートフォリオURL（複数可）
              </label>
              <div className="space-y-2">
                {formData.portfolioUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => {
                        const newUrls = [...formData.portfolioUrls];
                        newUrls[index] = e.target.value;
                        updateFormData({ portfolioUrls: newUrls });
                      }}
                      className="flex-1 px-3 py-2 border border-[var(--c-border)] rounded-md"
                      placeholder="https://example.com"
                    />
                    <button
                      type="button"
                      onClick={() => updateFormData({
                        portfolioUrls: formData.portfolioUrls.filter((_, i) => i !== index)
                      })}
                      className="px-3 py-2 text-red-500 hover:text-red-700"
                    >
                      削除
                    </button>
                  </div>
                ))}
                {formData.portfolioUrls.length < 10 && (
                  <button
                    type="button"
                    onClick={() => updateFormData({
                      portfolioUrls: [...formData.portfolioUrls, '']
                    })}
                    className="text-[var(--c-blue)] hover:underline text-sm"
                  >
                    + URLを追加
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                自己紹介・実績
              </label>
              <textarea
                value={formData.intro}
                onChange={(e) => updateFormData({ intro: e.target.value })}
                rows={6}
                className={`w-full px-3 py-2 border rounded-md ${u.focus} border-[var(--c-border)]`}
                placeholder="会社の強み、実績、得意分野などを記述してください"
              />
              <div className="text-xs text-[var(--c-text-muted)] mt-1">
                {(formData.intro?.length || 0)}/2000
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                提出書類（任意）
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-[var(--c-text-muted)] mb-2">会社概要PDF</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'doc');
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--c-text-muted)] mb-2">実績資料</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const kind = file.type.startsWith('image/') ? 'image' : 'doc';
                        handleFileUpload(file, kind);
                      }
                    }}
                    className="w-full"
                  />
                </div>
              </div>

              {errors.documents && (
                <p className="text-red-500 text-sm">{errors.documents}</p>
              )}

              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{attachment.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAttachments(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="p-4 bg-[var(--c-blue-bg)] rounded-md">
              <h3 className="font-medium text-[var(--c-blue-strong)] mb-2">登録内容の確認</h3>
              <div className="space-y-2 text-sm">
                <p><strong>会社名:</strong> {formData.companyName}</p>
                <p><strong>連絡先メール:</strong> {formData.contactEmail}</p>
                {formData.industries.length > 0 && (
                  <p><strong>業種:</strong> {formData.industries.join(', ')}</p>
                )}
                {formData.serviceAreas.length > 0 && (
                  <p><strong>対応エリア:</strong> {formData.serviceAreas.join(', ')}</p>
                )}
                <p><strong>適格請求書:</strong> {formData.invoiceQualified ? 'はい' : 'いいえ'}</p>
              </div>
            </div>

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
                {isSubmitting ? '登録中...' : '登録する'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
