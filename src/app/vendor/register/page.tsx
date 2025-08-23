'use client';
import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VendorSchema, VendorStep1Schema, VendorStep2Schema, VendorStep3Schema, VendorStep4Schema, VendorStep5Schema, type VendorInput, PREFECTURES, CATEGORIES, REGIONS } from '@/lib/validation/vendor';
import { Wizard } from '@/components/forms/Wizard';
// import UploadDrop from '@/components/forms/UploadDrop';
import { AnchorIcon, CheckCircleIcon } from '@/components/icons';

const TOTAL_STEPS = 5;

export default function VendorRegisterPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  
  const methods = useForm<VendorInput>({ 
    resolver: zodResolver(VendorSchema), 
    mode: 'onChange',
    defaultValues: { 
      categories: [], 
      regions: [],
      files: [],
      agreeTerms: false, 
      agreeNoBypass: false 
    } 
  });
  
  const { register, handleSubmit, watch, setValue, trigger, formState: { errors, isValid } } = methods;

  // 下書き保存
  useEffect(() => {
    const saveDraft = async (data: any) => {
      try {
        await fetch(`/api/drafts/vendor`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payload: data })
        });
      } catch (error) {
        console.error('Draft save error:', error);
      }
    };

    const sub = watch((v) => {
      // 5秒debounce
      const timeoutId = setTimeout(() => saveDraft(v), 5000);
      return () => clearTimeout(timeoutId);
    });

    // 初期化時にドラフト復元
    const loadDraft = async () => {
      try {
        const response = await fetch('/api/drafts/vendor');
        if (response.ok) {
          const draft = await response.json();
          if (draft && draft.payload) {
            methods.reset(draft.payload);
          }
        }
      } catch (error) {
        console.error('Draft load error:', error);
      }
    };

    loadDraft();
    return () => sub.unsubscribe();
  }, [watch, methods]);

  // ステップ別バリデーション
  const validateStep = async (currentStep: number): Promise<boolean> => {
    let stepSchema;
    switch (currentStep) {
      case 1:
        stepSchema = VendorStep1Schema;
        break;
      case 2:
        stepSchema = VendorStep2Schema;
        break;
      case 3:
        stepSchema = VendorStep3Schema;
        break;
      case 4:
        stepSchema = VendorStep4Schema;
        break;
      case 5:
        stepSchema = VendorStep5Schema;
        break;
      default:
        return true;
    }

    const fields = Object.keys(stepSchema.shape);
    const result = await trigger(fields as any);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(step);
    if (isValid) {
      setStep(s => Math.min(TOTAL_STEPS, s + 1));
      setSubmitError('');
    }
  };

  const handlePrev = () => {
    setStep(s => Math.max(1, s - 1));
    setSubmitError('');
  };

  const onFiles = async (files: File[]) => {
    try {
      const newFiles = files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file) // 開発用プレビュー
      }));

      const currentFiles = watch('files') || [];
      setValue('files', [...currentFiles, ...newFiles], { shouldValidate: true });
    } catch (error) {
      console.error('Upload error:', error);
      alert('ファイルの処理に失敗しました');
    }
  };

  const onSubmit = async (data: VendorInput) => {
    if (step < TOTAL_STEPS) { 
      await handleNext();
      return; 
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const res = await fetch('/api/vendors', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(data) 
      });
      
      const result = await res.json();
      
      if (!res.ok) { 
        setSubmitError(result.message || '登録に失敗しました');
        return; 
      }
      
      // ドラフト削除
      try {
        await fetch('/api/drafts/vendor', { method: 'DELETE' });
      } catch (e) {
        console.error('Draft delete error:', e);
      }
      
      alert('事業者登録を受け付けました。審査中です（1-3営業日）');
      location.href = '/me?vendor=1';
    } catch (error) {
      setSubmitError('登録に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedValues = watch();
  const canProceed = step < TOTAL_STEPS ? true : (isValid && watchedValues.agreeTerms && watchedValues.agreeNoBypass);

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-4xl p-4 pb-32">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[var(--c-blue-strong)] mb-2">
            <AnchorIcon className="inline-block w-8 h-8 mr-2 text-[var(--c-blue)]" />
            事業者登録
          </h1>
          <p className="text-[var(--c-text-muted)]">
            事業者として登録し、ニーズに応えるサービスを提供できます
          </p>
        </div>

        {/* エラーサマリー */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md" role="alert">
            <p className="text-red-700 text-sm">{submitError}</p>
          </div>
        )}

        {/* ステッパー */}
        <Wizard step={step} total={TOTAL_STEPS} />

        {/* フォーム */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: 基本情報 */}
          {step === 1 && (
            <section className="space-y-6" aria-labelledby="step1-heading">
              <h2 id="step1-heading" className="text-xl font-semibold text-[var(--c-text)]">基本情報</h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="orgType" className="block text-sm font-medium text-[var(--c-text)] mb-2">
                    組織形態 <span className="text-red-500">*</span>
                  </label>
                  <select 
                    id="orgType"
                    {...register('orgType')}
                    className={`w-full px-3 py-2 border rounded-md ${errors.orgType ? 'border-red-500' : 'border-[var(--c-border)]'}`}
                    aria-invalid={!!errors.orgType}
                    aria-describedby={errors.orgType ? 'orgType-error' : undefined}
                  >
                    <option value="">選択してください</option>
                    <option value="corporation">法人</option>
                    <option value="sole">個人事業主</option>
                  </select>
                  {errors.orgType && (
                    <p id="orgType-error" className="text-red-500 text-sm mt-1">{errors.orgType.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-[var(--c-text)] mb-2">
                    会社名・ブランド名 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="companyName"
                    type="text"
                    {...register('companyName')}
                    className={`w-full px-3 py-2 border rounded-md ${errors.companyName ? 'border-red-500' : 'border-[var(--c-border)]'}`}
                    aria-invalid={!!errors.companyName}
                    aria-describedby={errors.companyName ? 'companyName-error' : undefined}
                  />
                  {errors.companyName && (
                    <p id="companyName-error" className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="representative" className="block text-sm font-medium text-[var(--c-text)] mb-2">
                    代表者名
                  </label>
                  <input 
                    id="representative"
                    type="text"
                    {...register('representative')}
                    className="w-full px-3 py-2 border border-[var(--c-border)] rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[var(--c-text)] mb-2">
                    電話番号 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9\-\(\)\s]*"
                    {...register('phone')}
                    className={`w-full px-3 py-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-[var(--c-border)]'}`}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                    placeholder="例: 03-1234-5678"
                  />
                  {errors.phone && (
                    <p id="phone-error" className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="prefecture" className="block text-sm font-medium text-[var(--c-text)] mb-2">
                    都道府県 <span className="text-red-500">*</span>
                  </label>
                  <select 
                    id="prefecture"
                    {...register('prefecture')}
                    className={`w-full px-3 py-2 border rounded-md ${errors.prefecture ? 'border-red-500' : 'border-[var(--c-border)]'}`}
                    aria-invalid={!!errors.prefecture}
                    aria-describedby={errors.prefecture ? 'prefecture-error' : undefined}
                  >
                    <option value="">選択してください</option>
                    {PREFECTURES.map(pref => (
                      <option key={pref} value={pref}>{pref}</option>
                    ))}
                  </select>
                  {errors.prefecture && (
                    <p id="prefecture-error" className="text-red-500 text-sm mt-1">{errors.prefecture.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-[var(--c-text)] mb-2">
                    市区町村 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="city"
                    type="text"
                    {...register('city')}
                    className={`w-full px-3 py-2 border rounded-md ${errors.city ? 'border-red-500' : 'border-[var(--c-border)]'}`}
                    aria-invalid={!!errors.city}
                    aria-describedby={errors.city ? 'city-error' : undefined}
                  />
                  {errors.city && (
                    <p id="city-error" className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Step 2: 事業内容 */}
          {step === 2 && (
            <section className="space-y-6" aria-labelledby="step2-heading">
              <h2 id="step2-heading" className="text-xl font-semibold text-[var(--c-text)]">事業内容</h2>
              
              <div>
                <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                  カテゴリ <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CATEGORIES.map(category => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        value={category}
                        onChange={(e) => {
                          const current = watch('categories') || [];
                          const newCategories = e.target.checked
                            ? [...current, category]
                            : current.filter(c => c !== category);
                          setValue('categories', newCategories, { shouldValidate: true });
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
                {errors.categories && (
                  <p className="text-red-500 text-sm mt-1">{errors.categories.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="services" className="block text-sm font-medium text-[var(--c-text)] mb-2">
                  事業内容 <span className="text-red-500">*</span>
                </label>
                <textarea 
                  id="services"
                  rows={6}
                  {...register('services')}
                  className={`w-full px-3 py-2 border rounded-md ${errors.services ? 'border-red-500' : 'border-[var(--c-border)]'}`}
                  aria-invalid={!!errors.services}
                  aria-describedby={errors.services ? 'services-error' : undefined}
                  placeholder="提供しているサービスや事業内容を詳しく説明してください"
                />
                {errors.services && (
                  <p id="services-error" className="text-red-500 text-sm mt-1">{errors.services.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                  対応エリア <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {REGIONS.map(region => (
                    <label key={region} className="flex items-center">
                      <input
                        type="checkbox"
                        value={region}
                        onChange={(e) => {
                          const current = watch('regions') || [];
                          const newRegions = e.target.checked
                            ? [...current, region]
                            : current.filter(r => r !== region);
                          setValue('regions', newRegions, { shouldValidate: true });
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{region}</span>
                    </label>
                  ))}
                </div>
                {errors.regions && (
                  <p className="text-red-500 text-sm mt-1">{errors.regions.message}</p>
                )}
              </div>
            </section>
          )}

          {/* Step 3: アカウント情報 */}
          {step === 3 && (
            <section className="space-y-6" aria-labelledby="step3-heading">
              <h2 id="step3-heading" className="text-xl font-semibold text-[var(--c-text)]">アカウント情報</h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--c-text)] mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="email"
                    type="email"
                    {...register('email')}
                    className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-[var(--c-border)]'}`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[var(--c-text)] mb-2">
                    パスワード <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="password"
                    type="password"
                    {...register('password')}
                    className={`w-full px-3 py-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-[var(--c-border)]'}`}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : 'password-help'}
                  />
                  <p id="password-help" className="text-[var(--c-text-muted)] text-sm mt-1">
                    8文字以上、英数字を含めてください
                  </p>
                  {errors.password && (
                    <p id="password-error" className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-[var(--c-text)] mb-2">
                    担当部署
                  </label>
                  <input 
                    id="department"
                    type="text"
                    {...register('department')}
                    className="w-full px-3 py-2 border border-[var(--c-border)] rounded-md"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Step 4: ファイルアップロード */}
          {step === 4 && (
            <section className="space-y-6" aria-labelledby="step4-heading">
              <h2 id="step4-heading" className="text-xl font-semibold text-[var(--c-text)]">証明・登録ファイル</h2>
              <p className="text-[var(--c-text-muted)] text-sm">
                事業者登録の証明となる書類をアップロードできます（任意）
              </p>
              
              <div className="p-4 border border-[var(--c-border)] rounded-md text-center text-[var(--c-text-muted)]">
                ファイルアップロード機能（開発中）
              </div>
              
              {(watch('files') || []).length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-[var(--c-text)]">アップロード済みファイル</h3>
                  {watch('files')?.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const current = watch('files') || [];
                          setValue('files', current.filter((_, i) => i !== index), { shouldValidate: true });
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Step 5: 規約同意 */}
          {step === 5 && (
            <section className="space-y-6" aria-labelledby="step5-heading">
              <h2 id="step5-heading" className="text-xl font-semibold text-[var(--c-text)]">規約同意</h2>
              
              <div className="space-y-4 p-4 bg-[var(--c-card)] rounded-md border border-[var(--c-border)]">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    {...register('agreeTerms')}
                    className="mt-1"
                    aria-invalid={!!errors.agreeTerms}
                    aria-describedby={errors.agreeTerms ? 'agreeTerms-error' : undefined}
                  />
                  <div className="text-sm">
                    <span className="text-[var(--c-text)]">
                      <a href="/legal/terms" target="_blank" className="text-[var(--c-blue)] hover:underline">
                        利用規約
                      </a>、
                      <a href="/legal/privacy" target="_blank" className="text-[var(--c-blue)] hover:underline">
                        プライバシーポリシー
                      </a>に同意します <span className="text-red-500">*</span>
                    </span>
                  </div>
                </label>
                {errors.agreeTerms && (
                  <p id="agreeTerms-error" className="text-red-500 text-sm">{errors.agreeTerms.message}</p>
                )}

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    {...register('agreeNoBypass')}
                    className="mt-1"
                    aria-invalid={!!errors.agreeNoBypass}
                    aria-describedby={errors.agreeNoBypass ? 'agreeNoBypass-error' : undefined}
                  />
                  <div className="text-sm">
                    <span className="text-[var(--c-text)]">
                      直取引禁止（プラットフォーム外に誘導しない）に同意します <span className="text-red-500">*</span>
                    </span>
                  </div>
                </label>
                {errors.agreeNoBypass && (
                  <p id="agreeNoBypass-error" className="text-red-500 text-sm">{errors.agreeNoBypass.message}</p>
                )}
              </div>

              {/* 確認サマリー */}
              <div className="p-4 bg-[var(--c-blue-bg)] rounded-md">
                <h3 className="font-medium text-[var(--c-blue-strong)] mb-2">登録内容の確認</h3>
                <div className="space-y-1 text-sm text-[var(--c-blue)]">
                  <p><strong>会社名:</strong> {watchedValues.companyName}</p>
                  <p><strong>組織形態:</strong> {watchedValues.orgType === 'corporation' ? '法人' : '個人事業主'}</p>
                  <p><strong>所在地:</strong> {watchedValues.prefecture} {watchedValues.city}</p>
                  <p><strong>カテゴリ:</strong> {(watchedValues.categories || []).join(', ')}</p>
                </div>
              </div>
            </section>
          )}
        </form>

        {/* 固定CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--c-border)] p-4 lg:p-6 z-50">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="text-sm text-[var(--c-text-muted)]">
                <span className="font-medium">ステップ {step}/{TOTAL_STEPS}</span>
                <span className="hidden sm:inline"> - 事業者登録</span>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className={`flex-1 sm:flex-none px-4 py-2 border border-[var(--c-border)] rounded-md text-[var(--c-text)] hover:bg-gray-50`}
                    aria-label="前のステップに戻る"
                  >
                    戻る
                  </button>
                )}
                
                {step < TOTAL_STEPS ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed}
                    className={`flex-1 sm:flex-none px-6 py-2 bg-[var(--c-blue)] text-white rounded-md hover:bg-[var(--c-blue-strong)] disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-label="次のステップに進む"
                    aria-busy={false}
                  >
                    次へ
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                    disabled={!canProceed || isSubmitting}
                    className={`flex-1 sm:flex-none px-6 py-2 bg-[var(--c-blue)] text-white rounded-md hover:bg-[var(--c-blue-strong)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                    aria-label="事業者登録を完了する"
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        登録中...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        登録する
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
