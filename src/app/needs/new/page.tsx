'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PlusIcon } from '@/components/icons';

const schema = z.object({
  title: z.string().min(5, 'タイトルは5文字以上で入力してください').max(100, 'タイトルは100文字以内で入力してください'),
  summary: z.string().min(10, '概要は10文字以上で入力してください').max(500, '概要は500文字以内で入力してください'),
  category: z.string().min(1, 'カテゴリを選択してください'),
  area: z.string().min(1, 'エリアを選択してください'),
  quantity: z.number().min(1, '数量は1以上で入力してください'),
  desiredTiming: z.string().min(1, '希望時期を選択してください'),
  budget: z.number().optional(),
  requirements: z.string().optional(),
  visibility: z.enum(['public', 'private']).default('public'),
  agree: z.literal(true, { errorMap: () => ({ message: '利用規約に同意してください' }) }),
});

type FormValues = z.infer<typeof schema>;

export default function NeedsNewPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      // ダミーAPI送信（200返すだけ）
      const response = await fetch('/api/needs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      if (response.ok) {
        // 完了画面に遷移（IDダミー表示）
        router.push('/needs/new/complete?id=need_demo_123');
      } else {
        throw new Error('投稿に失敗しました');
      }
    } catch (error) {
      console.error('Error submitting need:', error);
      alert('投稿に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <PlusIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[var(--c-text)] mb-2">ニーズを投稿</h1>
          <p className="text-[var(--c-text-muted)]">
            地域のニーズを投稿して、適切な事業者とつながりましょう
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* ステップ1: 基本情報 */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--c-text)] mb-4 flex items-center gap-2">
                <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                基本情報
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-[var(--c-text)] mb-1">
                    タイトル <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    {...register('title')}
                    className="w-full px-3 py-2 border border-[var(--c-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="ニーズのタイトルを入力"
                  />
                  {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="summary" className="block text-sm font-medium text-[var(--c-text)] mb-1">
                    概要 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="summary"
                    rows={6}
                    {...register('summary')}
                    className="w-full px-3 py-2 border border-[var(--c-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="ニーズの概要を具体的に説明してください"
                  />
                  {errors.summary && <p className="text-sm text-red-600 mt-1">{errors.summary.message}</p>}
                </div>
              </div>
            </div>

            {/* ステップ2: エリア・カテゴリ */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--c-text)] mb-4 flex items-center gap-2">
                <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                エリア・カテゴリ
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="area" className="block text-sm font-medium text-[var(--c-text)] mb-1">
                    エリア <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="area"
                    {...register('area')}
                    className="w-full px-3 py-2 border border-[var(--c-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">エリアを選択</option>
                    <option value="tokyo">東京都</option>
                    <option value="osaka">大阪府</option>
                    <option value="kyoto">京都府</option>
                    <option value="hokkaido">北海道</option>
                    <option value="fukushima">福島県</option>
                    <option value="other">その他</option>
                  </select>
                  {errors.area && <p className="text-sm text-red-600 mt-1">{errors.area.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-[var(--c-text)] mb-1">
                    カテゴリ <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    {...register('category')}
                    className="w-full px-3 py-2 border border-[var(--c-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">カテゴリを選択</option>
                    <option value="business">ビジネス</option>
                    <option value="community">コミュニティ</option>
                    <option value="education">教育</option>
                    <option value="environment">環境</option>
                    <option value="health">健康・医療</option>
                    <option value="technology">テクノロジー</option>
                    <option value="other">その他</option>
                  </select>
                  {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>}
                </div>
              </div>
            </div>

            {/* ステップ3: 数量・希望条件 */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--c-text)] mb-4 flex items-center gap-2">
                <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                数量・希望条件
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-[var(--c-text)] mb-1">
                    数量 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    {...register('quantity', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-[var(--c-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="数量を入力"
                    min="1"
                  />
                  {errors.quantity && <p className="text-sm text-red-600 mt-1">{errors.quantity.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="desiredTiming" className="block text-sm font-medium text-[var(--c-text)] mb-1">
                    希望時期 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="desiredTiming"
                    {...register('desiredTiming')}
                    className="w-full px-3 py-2 border border-[var(--c-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">希望時期を選択</option>
                    <option value="asap">できるだけ早く</option>
                    <option value="1month">1ヶ月以内</option>
                    <option value="3months">3ヶ月以内</option>
                    <option value="6months">6ヶ月以内</option>
                    <option value="1year">1年以内</option>
                    <option value="flexible">柔軟</option>
                  </select>
                  {errors.desiredTiming && <p className="text-sm text-red-600 mt-1">{errors.desiredTiming.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-[var(--c-text)] mb-1">
                    予算（任意）
                  </label>
                  <input
                    type="number"
                    id="budget"
                    {...register('budget', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-[var(--c-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="予算を入力（円）"
                    min="0"
                  />
                </div>
                
                <div>
                  <label htmlFor="requirements" className="block text-sm font-medium text-[var(--c-text)] mb-1">
                    希望条件（任意）
                  </label>
                  <textarea
                    id="requirements"
                    rows={4}
                    {...register('requirements')}
                    className="w-full px-3 py-2 border border-[var(--c-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="希望する条件や要件があれば記入してください"
                  />
                </div>
              </div>
            </div>

            {/* ステップ4: 公開設定 */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--c-text)] mb-4 flex items-center gap-2">
                <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                公開設定
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="public"
                    value="public"
                    {...register('visibility')}
                    className="mr-2"
                    defaultChecked
                  />
                  <label htmlFor="public" className="text-sm text-[var(--c-text)]">
                    公開（一般ユーザーに表示）
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="private"
                    value="private"
                    {...register('visibility')}
                    className="mr-2"
                  />
                  <label htmlFor="private" className="text-sm text-[var(--c-text)]">
                    非公開（自分と事業者のみ）
                  </label>
                </div>
              </div>
            </div>

            {/* ステップ5: 同意 */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--c-text)] mb-4 flex items-center gap-2">
                <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">5</span>
                同意
              </h3>
              
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agree"
                  {...register('agree')}
                  className="mt-1 mr-2"
                />
                <label htmlFor="agree" className="text-sm text-[var(--c-text-muted)]">
                  <Link href="/legal/terms" className="text-green-600 hover:text-green-700">
                    利用規約
                  </Link>
                  に同意します
                </label>
              </div>
              {errors.agree && <p className="text-sm text-red-600 mt-1">{errors.agree.message}</p>}
            </div>

            <button
              type="submit"
              disabled={!isValid || submitting}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {submitting ? '投稿中…' : 'ニーズを投稿'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--c-border)] text-center">
            <p className="text-sm text-[var(--c-text-muted)]">
              投稿前に
              <Link href="/needs" className="text-green-600 hover:text-green-700">
                既存のニーズ
              </Link>
              もご確認ください
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
