import { z } from 'zod';

export const NeedSchema = z.object({
  title: z.string().min(6, 'タイトルは6文字以上で入力してください').max(80, 'タイトルは80文字以内で入力してください'),
  summary: z.string().min(20, '概要は20文字以上で入力してください').max(280, '概要は280文字以内で入力してください'),
  body: z.string().min(50, '詳細は50文字以上で入力してください').max(4000, '詳細は4000文字以内で入力してください'),
  area: z.string().min(1, 'エリアを入力してください'),
  category: z.string().min(1, 'カテゴリを入力してください'),
  quantity: z.number().int().positive('人数は1以上の整数で入力してください'),
  unitPrice: z.number().positive('単価は1以上の数値で入力してください'),
  desiredTiming: z.string().min(1, '希望時期を入力してください'),
  privacy: z.enum(['public', 'registered'], { 
    errorMap: () => ({ message: '公開範囲を選択してください' }) 
  }),
  agreeTerms: z.literal(true, { 
    errorMap: () => ({ message: '利用規約への同意が必要です' }) 
  }),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url()
  })).optional(),
});

export type NeedInput = z.infer<typeof NeedSchema>;
