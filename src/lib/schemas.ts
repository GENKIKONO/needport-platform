import { z } from "zod";

// UUID validation
const uuidSchema = z.string().uuid();

// Offer schemas
export const OfferCreateSchema = z.object({
  needId: uuidSchema,
  vendorName: z.string().min(1, "ベンダー名は必須です").max(120, "ベンダー名は120文字以内で入力してください"),
  amount: z.number().positive("金額は正の数で入力してください"),
});

export const OfferUpdateSchema = z.object({
  vendorName: z.string().min(1, "ベンダー名は必須です").max(120, "ベンダー名は120文字以内で入力してください").optional(),
  amount: z.number().positive("金額は正の数で入力してください").optional(),
});

// Adoption schema
export const AdoptSchema = z.object({
  offerId: uuidSchema.nullable(),
  minPeople: z.number().int().positive("最低人数は正の整数で入力してください").optional(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日付はYYYY-MM-DD形式で入力してください").optional(),
});

// Entry schema
export const EntryCreateSchema = z.object({
  name: z.string().min(1, "名前は必須です").max(120, "名前は120文字以内で入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください").min(5, "メールアドレスは5文字以上で入力してください").max(200, "メールアドレスは200文字以内で入力してください"),
  count: z.number().int().positive("参加人数は正の整数で入力してください").max(100, "参加人数は100人以下で入力してください"),
  note: z.string().max(500, "備考は500文字以内で入力してください").optional(),
});

// Type exports
export type OfferCreate = z.infer<typeof OfferCreateSchema>;
export type OfferUpdate = z.infer<typeof OfferUpdateSchema>;
export type Adopt = z.infer<typeof AdoptSchema>;
export type EntryCreate = z.infer<typeof EntryCreateSchema>;
