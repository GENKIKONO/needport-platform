'use client';
import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VendorSchema, type VendorInput } from '@/lib/validation/vendor';
import { Wizard } from '@/components/forms/Wizard';
import UploadDrop from '@/components/forms/UploadDrop';

const TOTAL = 3;

export default function VendorRegisterPage() {
  const [step, setStep] = useState(1);
  const methods = useForm<VendorInput>({ 
    resolver: zodResolver(VendorSchema), 
    defaultValues: { 
      capabilities: [], 
      agreeTerms: false, 
      agreeNoBypass: false 
    } 
  });
  const { register, handleSubmit, watch, setValue, formState: { errors } } = methods;

  // 下書き保存
  useEffect(() => {
    const sub = watch((v) => localStorage.setItem('vendor.draft', JSON.stringify(v)));
    const raw = localStorage.getItem('vendor.draft'); 
    if (raw) { 
      try { 
        methods.reset(JSON.parse(raw)); 
      } catch {} 
    }
    return () => sub.unsubscribe();
  }, [watch, methods]);

  const onFiles = (files: File[]) => {
    const up = files.map(f => ({ name: f.name, url: URL.createObjectURL(f) }));
    const cur = watch('attachments') || [];
    setValue('attachments', [...cur, ...up], { shouldValidate: true });
  };

  const next = () => setStep(s => Math.min(TOTAL, s + 1));
  const prev = () => setStep(s => Math.max(1, s - 1));

  const onSubmit = async (data: VendorInput) => {
    if (step < TOTAL) { 
      next(); 
      return; 
    }
    
    try {
      const res = await fetch('/api/vendors', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(data) 
      });
      if (!res.ok) { 
        alert('登録に失敗しました'); 
        return; 
      }
      localStorage.removeItem('vendor.draft');
      location.href = '/me?vendor=1';
    } catch (error) {
      alert('登録に失敗しました');
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-3xl p-4">
        <h1 className="text-2xl font-bold text-[var(--c-blue-strong)]">事業者登録</h1>
        <Wizard step={step} total={TOTAL} />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <section className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[var(--c-text)]">会社名</label>
                <input {...register('companyName')} className="mt-1 w-full rounded border border-[var(--c-border)] p-2" />
                {errors.companyName && <p className="text-xs text-red-600">{errors.companyName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--c-text)]">会社名（カナ）</label>
                <input {...register('companyKana')} className="mt-1 w-full rounded border border-[var(--c-border)] p-2" />
                {errors.companyKana && <p className="text-xs text-red-600">{errors.companyKana.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--c-text)]">都道府県</label>
                <input {...register('prefecture')} className="mt-1 w-full rounded border border-[var(--c-border)] p-2" />
                {errors.prefecture && <p className="text-xs text-red-600">{errors.prefecture.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--c-text)]">Webサイト（任意）</label>
                <input {...register('website')} className="mt-1 w-full rounded border border-[var(--c-border)] p-2" />
                {errors.website && <p className="text-xs text-red-600">{errors.website.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--c-text)]">代表者</label>
                <input {...register('representative')} className="mt-1 w-full rounded border border-[var(--c-border)] p-2" />
                {errors.representative && <p className="text-xs text-red-600">{errors.representative.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--c-text)]">メール</label>
                <input {...register('contactEmail')} className="mt-1 w-full rounded border border-[var(--c-border)] p-2" />
                {errors.contactEmail && <p className="text-xs text-red-600">{errors.contactEmail.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--c-text)]">電話</label>
                <input {...register('phone')} className="mt-1 w-full rounded border border-[var(--c-border)] p-2" />
                {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
              </div>
            </section>
          )}
          {step === 2 && (
            <section className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--c-text)]">事業紹介</label>
                <textarea {...register('description')} rows={6} className="mt-1 w-full rounded border border-[var(--c-border)] p-2" />
                {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--c-text)]">できること（カンマ区切り）</label>
                <input 
                  className="mt-1 w-full rounded border border-[var(--c-border)] p-2"
                  onChange={(e) => methods.setValue('capabilities', e.target.value.split(',').map(s => s.trim()).filter(Boolean), { shouldValidate: true })}
                />
                {errors.capabilities && <p className="text-xs text-red-600">少なくとも1つ入力してください</p>}
              </div>
              <UploadDrop onFiles={onFiles} />
            </section>
          )}
          {step === 3 && (
            <section className="space-y-3 rounded border border-[var(--c-border)] p-4 bg-[var(--c-card)]">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register('agreeTerms')} />
                利用規約・プライバシーに同意します
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register('agreeNoBypass')} />
                直取引禁止（プラットフォーム外に誘導しない）に同意します
              </label>
              {errors.agreeTerms && <p className="text-xs text-red-600">同意が必要です</p>}
              {errors.agreeNoBypass && <p className="text-xs text-red-600">同意が必要です</p>}
            </section>
          )}
          <div className="flex justify-between">
            <button type="button" onClick={prev} className="rounded border border-[var(--c-border)] px-4 py-2 text-[var(--c-text)]">
              戻る
            </button>
            {step < TOTAL ? (
              <button type="button" onClick={next} className="rounded bg-[var(--c-blue)] px-4 py-2 text-white">
                次へ
              </button>
            ) : (
              <button type="submit" className="rounded bg-[var(--c-blue)] px-4 py-2 text-white">
                登録する
              </button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
