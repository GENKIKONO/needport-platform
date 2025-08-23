'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { needExpandedSchema, type NeedExpandedInput } from '@/lib/validation/needExpanded';
import { NeedSchema, type NeedInput } from '@/lib/validation/needExtended';
import { uploadFile, validateFile, type FileKind } from '@/lib/storage';
import { getDevSession } from '@/lib/devAuth';
import { u } from '@/components/ui/u';

interface FormStep {
  title: string;
  description: string;
}

const STEPS: FormStep[] = [
  { title: '基本情報', description: 'タイトル、概要、本文を入力' },
  { title: '分類', description: 'エリア、カテゴリ、タグを設定' },
  { title: 'ボリューム＆価格', description: '数量、単価、概算を入力' },
  { title: '期間・公開範囲', description: '期間、公開範囲、連絡方法' },
  { title: '添付ファイル', description: '画像やドキュメントを添付' },
  { title: '確認＆同意', description: '内容確認と規約同意' }
];

interface Attachment {
  kind: FileKind;
  key: string;
  name: string;
  size: number;
  url?: string;
}

export default function NeedFormWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<NeedExpandedInput>>({
    visibility: 'public',
    contactPref: 'inapp',
    tags: [],
    attachments: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const devSession = getDevSession();

  // オートセーブ（草稿）
  useEffect(() => {
    const saved = localStorage.getItem('need-draft-v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse saved draft:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('need-draft-v1', JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (updates: Partial<NeedExpandedInput>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setErrors({});
  };

  const validateStep = (step: number): boolean => {
    const stepValidations = [
      // Step 0: 基本情報
      () => {
        if (!formData.title || formData.title.length < 8) {
          setErrors({ title: 'タイトルは8文字以上で入力してください' });
          return false;
        }
        if (!formData.summary || formData.summary.length < 20) {
          setErrors({ summary: '概要は20文字以上で入力してください' });
          return false;
        }
        if (!formData.body || formData.body.length < 80) {
          setErrors({ body: '本文は80文字以上で入力してください' });
          return false;
        }
        return true;
      },
      // Step 1: 分類
      () => {
        if (!formData.area) {
          setErrors({ area: 'エリアを選択してください' });
          return false;
        }
        if (!formData.category) {
          setErrors({ category: 'カテゴリを選択してください' });
          return false;
        }
        return true;
      },
      // Step 2: ボリューム＆価格（任意）
      () => true,
      // Step 3: 期間・公開範囲（任意）
      () => true,
      // Step 4: 添付ファイル（任意）
      () => true,
      // Step 5: 確認＆同意
      () => {
        if (!formData.agreeTerms) {
          setErrors({ agreeTerms: '利用規約に同意してください' });
          return false;
        }
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
      setErrors({ attachments: validation.error });
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
      updateFormData({
        attachments: [...(formData.attachments || []), {
          kind,
          key: result.key,
          name: file.name,
          size: file.size
        }]
      });
    } catch (error) {
      setErrors({ attachments: error instanceof Error ? error.message : 'アップロードに失敗しました' });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/needs/expanded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        setErrors(error.fields || { submit: error.message });
        return;
      }

      const result = await response.json();
      localStorage.removeItem('need-draft-v1');
      router.push(`/needs/${result.id}`);
    } catch (error) {
      setErrors({ submit: '投稿に失敗しました' });
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
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => updateFormData({ title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md ${u.focus} ${
                  errors.title ? 'border-red-500' : 'border-[var(--c-border)]'
                }`}
                placeholder="例：Webサイト制作のデザインを依頼したい"
              />
              <div className="flex justify-between text-xs text-[var(--c-text-muted)] mt-1">
                <span>{errors.title}</span>
                <span>{(formData.title?.length || 0)}/80</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                概要 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.summary || ''}
                onChange={(e) => updateFormData({ summary: e.target.value })}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md ${u.focus} ${
                  errors.summary ? 'border-red-500' : 'border-[var(--c-border)]'
                }`}
                placeholder="簡潔に要件を説明してください"
              />
              <div className="flex justify-between text-xs text-[var(--c-text-muted)] mt-1">
                <span>{errors.summary}</span>
                <span>{(formData.summary?.length || 0)}/240</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                本文 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.body || ''}
                onChange={(e) => updateFormData({ body: e.target.value })}
                rows={8}
                className={`w-full px-3 py-2 border rounded-md ${u.focus} ${
                  errors.body ? 'border-red-500' : 'border-[var(--c-border)]'
                }`}
                placeholder="詳細な要件、背景、希望する成果物などを記述してください"
              />
              <div className="flex justify-between text-xs text-[var(--c-text-muted)] mt-1">
                <span>{errors.body}</span>
                <span>{(formData.body?.length || 0)}/5000</span>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                エリア <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.area || ''}
                onChange={(e) => updateFormData({ area: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md ${u.focus} ${
                  errors.area ? 'border-red-500' : 'border-[var(--c-border)]'
                }`}
              >
                <option value="">エリアを選択</option>
                <option value="東京">東京</option>
                <option value="大阪">大阪</option>
                <option value="名古屋">名古屋</option>
                <option value="福岡">福岡</option>
                <option value="その他">その他</option>
              </select>
              {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                カテゴリ <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category || ''}
                onChange={(e) => updateFormData({ category: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md ${u.focus} ${
                  errors.category ? 'border-red-500' : 'border-[var(--c-border)]'
                }`}
              >
                <option value="">カテゴリを選択</option>
                <option value="IT・システム">IT・システム</option>
                <option value="デザイン・クリエイティブ">デザイン・クリエイティブ</option>
                <option value="マーケティング">マーケティング</option>
                <option value="営業・販売">営業・販売</option>
                <option value="その他">その他</option>
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                タグ（最大10個）
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(formData.tags || []).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-[var(--c-blue-bg)] text-[var(--c-blue-strong)] rounded-md text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => updateFormData({
                        tags: formData.tags?.filter((_, i) => i !== index)
                      })}
                      className="ml-1 text-[var(--c-blue-strong)] hover:text-[var(--c-blue)]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="タグを入力してEnter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = e.currentTarget.value.trim();
                    if (value && (formData.tags?.length || 0) < 10) {
                      updateFormData({
                        tags: [...(formData.tags || []), value]
                      });
                      e.currentTarget.value = '';
                    }
                  }
                }}
                className="w-full px-3 py-2 border border-[var(--c-border)] rounded-md"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                  数量
                </label>
                <input
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) => updateFormData({ quantity: parseInt(e.target.value) || undefined })}
                  className={`w-full px-3 py-2 border rounded-md ${u.focus} border-[var(--c-border)]`}
                  placeholder="例：1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                  単価（円）
                </label>
                <input
                  type="number"
                  value={formData.unitPrice || ''}
                  onChange={(e) => updateFormData({ unitPrice: parseInt(e.target.value) || undefined })}
                  className={`w-full px-3 py-2 border rounded-md ${u.focus} border-[var(--c-border)]`}
                  placeholder="例：50000"
                />
              </div>
            </div>

            {(formData.quantity && formData.unitPrice) && (
              <div className="p-4 bg-[var(--c-blue-bg)] rounded-md">
                <p className="text-sm text-[var(--c-blue-strong)]">
                  概算金額: <span className="font-semibold">
                    ¥{(formData.quantity * formData.unitPrice).toLocaleString()}
                  </span>
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                  希望開始日
                </label>
                <input
                  type="date"
                  value={formData.desiredStartDate || ''}
                  onChange={(e) => updateFormData({ desiredStartDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md ${u.focus} border-[var(--c-border)]`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                  希望終了日
                </label>
                <input
                  type="date"
                  value={formData.desiredEndDate || ''}
                  onChange={(e) => updateFormData({ desiredEndDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md ${u.focus} border-[var(--c-border)]`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                公開範囲
              </label>
              <div className="space-y-2">
                {[
                  { value: 'public', label: '公開', desc: '誰でも閲覧可能' },
                  { value: 'members', label: 'メンバーのみ', desc: 'ログインユーザーのみ' },
                  { value: 'private', label: '非公開', desc: '自分と管理者のみ' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={formData.visibility === option.value}
                      onChange={(e) => updateFormData({ visibility: e.target.value as any })}
                      className="mr-2"
                    />
                    <div>
                      <span className="font-medium">{option.label}</span>
                      <p className="text-sm text-[var(--c-text-muted)]">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                連絡方法
              </label>
              <div className="space-y-2">
                {[
                  { value: 'inapp', label: 'プラットフォーム内', desc: 'チャット機能を使用' },
                  { value: 'email', label: 'メール', desc: 'メールアドレスを公開' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="contactPref"
                      value={option.value}
                      checked={formData.contactPref === option.value}
                      onChange={(e) => updateFormData({ contactPref: e.target.value as any })}
                      className="mr-2"
                    />
                    <div>
                      <span className="font-medium">{option.label}</span>
                      <p className="text-sm text-[var(--c-text-muted)]">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                添付ファイル（最大10ファイル、1ファイル25MB以下）
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-[var(--c-text-muted)] mb-2">画像ファイル</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'image');
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--c-text-muted)] mb-2">PDFファイル</label>
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
              </div>

              {errors.attachments && (
                <p className="text-red-500 text-sm">{errors.attachments}</p>
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
                          updateFormData({
                            attachments: formData.attachments?.filter((_, i) => i !== index)
                          });
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

      case 5:
        return (
          <div className="space-y-6">
            <div className="p-4 bg-[var(--c-blue-bg)] rounded-md">
              <h3 className="font-medium text-[var(--c-blue-strong)] mb-2">投稿内容の確認</h3>
              <div className="space-y-2 text-sm">
                <p><strong>タイトル:</strong> {formData.title}</p>
                <p><strong>概要:</strong> {formData.summary}</p>
                <p><strong>エリア:</strong> {formData.area}</p>
                <p><strong>カテゴリ:</strong> {formData.category}</p>
                {formData.quantity && formData.unitPrice && (
                  <p><strong>概算金額:</strong> ¥{(formData.quantity * formData.unitPrice).toLocaleString()}</p>
                )}
                <p><strong>公開範囲:</strong> {
                  formData.visibility === 'public' ? '公開' :
                  formData.visibility === 'members' ? 'メンバーのみ' : '非公開'
                }</p>
              </div>
            </div>

            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms || false}
                  onChange={(e) => updateFormData({ agreeTerms: e.target.checked })}
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
              {errors.agreeTerms && (
                <p className="text-red-500 text-sm mt-1">{errors.agreeTerms}</p>
              )}
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
    <div className="max-w-4xl mx-auto">
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
                {isSubmitting ? '投稿中...' : '投稿する'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
