import { z } from 'zod';
import type { NeedScale } from '@/lib/domain/need';

export const needCreateSchema = z.object({
  title: z.string().min(4).max(80),
  summary: z.string().min(10).max(600),
  min_people: z.number().int().positive().max(999).optional().nullable(),
  price_amount: z.number().int().nonnegative().max(100000000).optional().nullable(),
  deadline: z.string().datetime().optional().nullable(), // ISO
  location: z.string().max(80).optional().nullable(),
  tags: z.array(z.string().min(1).max(20)).max(8).optional().nullable(),
  scale: z.enum(['personal', 'community']),
  macro_fee_hint: z.string().max(120).optional(),
  macro_use_freq: z.string().max(120).optional(),
  macro_area_hint: z.string().max(120).optional(),
  agree: z.literal(true), // 規約同意チェック
}).transform((v) => {
  if (v.scale === 'personal') {
    return { ...v, macro_fee_hint: null, macro_use_freq: null, macro_area_hint: null };
  }
  return v;
});

export type NeedCreateInput = z.infer<typeof needCreateSchema>;

// Legacy compatibility
export const NeedInput = needCreateSchema;

// メール/電話番号などのPIIをサーバ側で簡易除去
export function stripPII(s: string) {
  return s
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[removed:email]')
    .replace(/\b0\d{1,4}[-(]?\d{1,4}[-)]?\d{3,4}\b/g, '[removed:phone]');
}
