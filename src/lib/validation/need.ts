import { z } from 'zod';

export const NeedSchema = z.object({
  title: z.string().min(8, 'タイトルは8文字以上で入力してください').max(80, 'タイトルは80文字以内で入力してください'),
  summary: z.string().min(20, '概要は20文字以上で入力してください').max(200, '概要は200文字以内で入力してください'),
  body: z.string().min(80, '詳細は80文字以上で入力してください').max(2000, '詳細は2000文字以内で入力してください'),
  area: z.string().min(1, 'エリアを選択してください'),
  category: z.string().min(1, 'カテゴリを選択してください'),
  tags: z.array(z.string()).optional(),
  quantity: z.number().positive('数量は1以上で入力してください'),
  unitPrice: z.number().positive('単価は1以上で入力してください'),
  deadline: z.string().min(1, '期限を選択してください'),
  contactEmail: z.string().email('有効なメールアドレスを入力してください'),
  contactPhone: z.string().min(10, '電話番号は10桁以上で入力してください').max(15, '電話番号は15桁以内で入力してください'),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url()
  })).optional(),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: '利用規約への同意は必須です' })
  })
});

export type NeedFormData = z.infer<typeof NeedSchema>;

// Partial schemas for step validation
export const NeedStep1Schema = NeedSchema.pick({
  title: true,
  description: true,
  category: true
});

export const NeedStep2Schema = NeedSchema.pick({
  budget: true,
  deadline: true,
  location: true
});

export const NeedStep3Schema = NeedSchema.pick({
  contactEmail: true,
  contactPhone: true
});

export const NeedStep4Schema = NeedSchema.pick({
  termsAgreed: true,
  privacyAgreed: true
});

// Legacy compatibility
export const NeedInput = NeedSchema;

// メール/電話番号などのPIIをサーバ側で簡易除去
export function stripPII(s: string) {
  return s
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[removed:email]')
    .replace(/\b0\d{1,4}[-(]?\d{1,4}[-)]?\d{3,4}\b/g, '[removed:phone]');
}
