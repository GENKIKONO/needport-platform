'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const NeedFormSchema = z.object({
  title: z.string().min(8, 'タイトルは8文字以上で入力してください').max(80, 'タイトルは80文字以内で入力してください'),
  summary: z.string().min(20, '概要は20文字以上で入力してください').max(200, '概要は200文字以内で入力してください'),
  body: z.string().min(80, '詳細は80文字以上で入力してください').max(2000, '詳細は2000文字以内で入力してください'),
  area: z.string().min(1, 'エリアを選択してください'),
  category: z.string().min(1, 'カテゴリを選択してください'),
  quantity: z.number().positive('数量は1以上で入力してください'),
  unitPrice: z.number().positive('単価は1以上で入力してください'),
  contactEmail: z.string().email('有効なメールアドレスを入力してください'),
  contactPhone: z.string().min(10, '電話番号は10桁以上で入力してください').max(15, '電話番号は15桁以内で入力してください'),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: '利用規約への同意は必須です'
  })
});

type NeedFormData = z.infer<typeof NeedFormSchema>;

interface FormStep {
  title: string;
  description: string;
}

const STEPS: FormStep[] = [
  { title: '基本情報', description: 'タイトル、概要、本文を入力' },
  { title: '分類', description: 'エリア、カテゴリを設定' },
  { title: 'ボリューム＆価格', description: '数量、単価を入力' },
  { title: '連絡先', description: '連絡先情報を入力' },
  { title: '確認＆同意', description: '内容確認と規約同意' }
];

const PREFECTURES = [
  { value: 'hokkaido', label: '北海道' },
  { value: 'aomori', label: '青森県' },
  { value: 'iwate', label: '岩手県' },
  { value: 'miyagi', label: '宮城県' },
  { value: 'akita', label: '秋田県' },
  { value: 'yamagata', label: '山形県' },
  { value: 'fukushima', label: '福島県' },
  { value: 'ibaraki', label: '茨城県' },
  { value: 'tochigi', label: '栃木県' },
  { value: 'gunma', label: '群馬県' },
  { value: 'saitama', label: '埼玉県' },
  { value: 'chiba', label: '千葉県' },
  { value: 'tokyo', label: '東京都' },
  { value: 'kanagawa', label: '神奈川県' },
  { value: 'niigata', label: '新潟県' },
  { value: 'toyama', label: '富山県' },
  { value: 'ishikawa', label: '石川県' },
  { value: 'fukui', label: '福井県' },
  { value: 'yamanashi', label: '山梨県' },
  { value: 'nagano', label: '長野県' },
  { value: 'gifu', label: '岐阜県' },
  { value: 'shizuoka', label: '静岡県' },
  { value: 'aichi', label: '愛知県' },
  { value: 'mie', label: '三重県' },
  { value: 'shiga', label: '滋賀県' },
  { value: 'kyoto', label: '京都府' },
  { value: 'osaka', label: '大阪府' },
  { value: 'hyogo', label: '兵庫県' },
  { value: 'nara', label: '奈良県' },
  { value: 'wakayama', label: '和歌山県' },
  { value: 'tottori', label: '鳥取県' },
  { value: 'shimane', label: '島根県' },
  { value: 'okayama', label: '岡山県' },
  { value: 'hiroshima', label: '広島県' },
  { value: 'yamaguchi', label: '山口県' },
  { value: 'tokushima', label: '徳島県' },
  { value: 'kagawa', label: '香川県' },
  { value: 'ehime', label: '愛媛県' },
  { value: 'kochi', label: '高知県' },
  { value: 'fukuoka', label: '福岡県' },
  { value: 'saga', label: '佐賀県' },
  { value: 'nagasaki', label: '長崎県' },
  { value: 'kumamoto', label: '熊本県' },
  { value: 'oita', label: '大分県' },
  { value: 'miyazaki', label: '宮崎県' },
  { value: 'kagoshima', label: '鹿児島県' },
  { value: 'okinawa', label: '沖縄県' }
];

const CATEGORIES = [
  { value: 'web', label: 'Web制作' },
  { value: 'design', label: 'デザイン' },
  { value: 'development', label: 'システム開発' },
  { value: 'marketing', label: 'マーケティング' },
  { value: 'consulting', label: 'コンサルティング' },
  { value: 'other', label: 'その他' }
];

export default function NeedFormWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid }
  } = useForm<NeedFormData>({
    resolver: zodResolver(NeedFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      summary: '',
      body: '',
      area: '',
      category: '',
      quantity: 1,
      unitPrice: 0,
      contactEmail: '',
      contactPhone: '',
      agreeTerms: false
    }
  });

  // オートセーブ（草稿）
  useEffect(() => {
    const saved = localStorage.getItem('need-draft-v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.entries(parsed).forEach(([key, value]) => {
          setValue(key as keyof NeedFormData, value as any);
        });
      } catch (e) {
        console.error('Failed to parse saved draft:', e);
      }
    }
  }, [setValue]);

  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem('need-draft-v1', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const validateStep = async (step: number): Promise<boolean> => {
    const stepFields = {
      0: ['title', 'summary', 'body'],
      1: ['area', 'category'],
      2: ['quantity', 'unitPrice'],
      3: ['contactEmail', 'contactPhone'],
      4: ['agreeTerms']
    };

    const fields = stepFields[step as keyof typeof stepFields] || [];
    return await trigger(fields as any);
  };

  const handleNext = async () => {
    if (await validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: NeedFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/needs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Submit error:', error);
        return;
      }

      const result = await response.json();
      localStorage.removeItem('need-draft-v1');
      router.push(`/needs/${result.id}`);
    } catch (error) {
      console.error('Submit error:', error);
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
              <label className="block text-sm font-medium text-gray-900 mb-2">
                タイトル <span className="text-red-500">*</span>
              </label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      {...field}
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="例：Webサイト制作のデザインを依頼したい"
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>{errors.title?.message}</span>
                      <span>{(field.value?.length || 0)}/80</span>
                    </div>
                  </>
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                概要 <span className="text-red-500">*</span>
              </label>
              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <>
                    <textarea
                      {...field}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        errors.summary ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="簡潔に要件を説明してください"
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>{errors.summary?.message}</span>
                      <span>{(field.value?.length || 0)}/200</span>
                    </div>
                  </>
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                本文 <span className="text-red-500">*</span>
              </label>
              <Controller
                name="body"
                control={control}
                render={({ field }) => (
                  <>
                    <textarea
                      {...field}
                      rows={8}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        errors.body ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="詳細な要件、背景、希望する成果物などを記述してください"
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>{errors.body?.message}</span>
                      <span>{(field.value?.length || 0)}/2000</span>
                    </div>
                  </>
                )}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                エリア <span className="text-red-500">*</span>
              </label>
              <Controller
                name="area"
                control={control}
                render={({ field }) => (
                  <>
                    <select
                      {...field}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        errors.area ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">エリアを選択</option>
                      {PREFECTURES.map(pref => (
                        <option key={pref.value} value={pref.value}>
                          {pref.label}
                        </option>
                      ))}
                    </select>
                    {errors.area && (
                      <div className="text-xs text-red-500 mt-1">{errors.area.message}</div>
                    )}
                  </>
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                カテゴリ <span className="text-red-500">*</span>
              </label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <>
                    <select
                      {...field}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">カテゴリを選択</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <div className="text-xs text-red-500 mt-1">{errors.category.message}</div>
                    )}
                  </>
                )}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                数量 <span className="text-red-500">*</span>
              </label>
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      {...field}
                      type="number"
                      min="1"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        errors.quantity ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="1"
                    />
                    {errors.quantity && (
                      <div className="text-xs text-red-500 mt-1">{errors.quantity.message}</div>
                    )}
                  </>
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                単価（円） <span className="text-red-500">*</span>
              </label>
              <Controller
                name="unitPrice"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      {...field}
                      type="number"
                      min="0"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        errors.unitPrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="10000"
                    />
                    {errors.unitPrice && (
                      <div className="text-xs text-red-500 mt-1">{errors.unitPrice.message}</div>
                    )}
                  </>
                )}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <Controller
                name="contactEmail"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      {...field}
                      type="email"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        errors.contactEmail ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="example@example.com"
                    />
                    {errors.contactEmail && (
                      <div className="text-xs text-red-500 mt-1">{errors.contactEmail.message}</div>
                    )}
                  </>
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                電話番号 <span className="text-red-500">*</span>
              </label>
              <Controller
                name="contactPhone"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      {...field}
                      type="tel"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="090-1234-5678"
                    />
                    {errors.contactPhone && (
                      <div className="text-xs text-red-500 mt-1">{errors.contactPhone.message}</div>
                    )}
                  </>
                )}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">投稿内容の確認</h3>
              <p className="text-sm text-gray-600">
                以下の内容で投稿します。内容を確認してください。
              </p>
            </div>

            <div className="border border-gray-300 rounded-lg p-4 bg-white">
              <div className="space-y-3">
                <div>
                  <div className="font-medium text-gray-900">タイトル</div>
                  <p className="text-sm text-gray-600">{watch('title') || '未入力'}</p>
                </div>
                <div>
                  <div className="font-medium text-gray-900">概要</div>
                  <p className="text-sm text-gray-600 mb-3">{watch('summary') || '概要未入力'}</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {PREFECTURES.find(p => p.value === watch('area'))?.label || 'エリア未選択'}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {CATEGORIES.find(c => c.value === watch('category'))?.label || 'カテゴリ未選択'}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  数量: {watch('quantity') || 0} × 単価: {watch('unitPrice') || 0}円 = 
                  概算: {((watch('quantity') || 0) * (watch('unitPrice') || 0)).toLocaleString()}円
                </div>
              </div>
            </div>

            <div>
                                <Controller
                    name="agreeTerms"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mt-1"
                        />
                        <div className="text-sm">
                          <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                            利用規約
                          </a>
                          に同意します <span className="text-red-500">*</span>
                        </div>
                      </label>
                    )}
                  />
              {errors.agreeTerms && (
                <div className="text-xs text-red-500 mt-1">{errors.agreeTerms.message}</div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* プログレスバー */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {STEPS.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {STEPS[currentStep].title}
          </h2>
          <p className="text-sm text-gray-600">
            {STEPS[currentStep].description}
          </p>
        </div>
      </div>

      {/* フォーム */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {renderStep()}

        {/* ナビゲーション */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            戻る
          </button>

          <div className="flex gap-2">
            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                次へ
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isSubmitting ? '投稿中...' : '投稿する'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 固定CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:p-6 z-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{STEPS[currentStep].title}</span>
              <span className="hidden sm:inline"> - {STEPS[currentStep].description}</span>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  戻る
                </button>
              )}
              
              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isValid}
                  className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    !isValid ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  次へ
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting || !isValid}
                  className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    (isSubmitting || !isValid) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? '投稿中...' : 'ニーズを投稿する'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
