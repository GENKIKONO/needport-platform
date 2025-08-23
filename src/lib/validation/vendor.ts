import { z } from 'zod';

export const VendorSchema = z.object({
  companyName: z.string().min(2, '会社名は2文字以上で入力してください'),
  companyKana: z.string().min(2, '会社名（カナ）は2文字以上で入力してください'),
  prefecture: z.string().min(1, '都道府県を入力してください'),
  website: z.string().url('正しいURLを入力してください').optional().or(z.string().length(0)),
  contactEmail: z.string().email('正しいメールアドレスを入力してください'),
  phone: z.string().min(8, '電話番号は8文字以上で入力してください'),
  representative: z.string().min(2, '代表者名は2文字以上で入力してください'),
  description: z.string().min(30, '事業紹介は30文字以上で入力してください').max(2000, '事業紹介は2000文字以内で入力してください'),
  capabilities: z.array(z.object({
    title: z.string().min(1, 'タイトルを入力してください'),
    detail: z.string().optional()
  })).min(1, 'できることを1つ以上入力してください'),
  agreeTerms: z.literal(true, { 
    errorMap: () => ({ message: '利用規約への同意が必要です' }) 
  }),
  agreeNoBypass: z.literal(true, { 
    errorMap: () => ({ message: '直取引禁止への同意が必要です' }) 
  }),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url()
  })).optional(),
});

export type VendorInput = z.infer<typeof VendorSchema>;
