import { z } from "zod";

export const needExpandedSchema = z.object({
  title: z.string().min(8).max(80),
  summary: z.string().min(20).max(240),
  body: z.string().min(80).max(5000),
  area: z.string().min(1),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  tags: z.array(z.string().min(1)).max(10).optional(),
  quantity: z.number().int().positive().max(100000).optional(),
  unitPrice: z.number().int().positive().max(100000000).optional(),
  desiredStartDate: z.string().optional(),   // ISO
  desiredEndDate: z.string().optional(),
  visibility: z.enum(["public","members","private"]).default("public"),
  contactPref: z.enum(["inapp","email"]).default("inapp"),
  attachments: z.array(z.object({
    kind: z.enum(["image","doc"]),
    key: z.string(),
    name: z.string(),
    size: z.number().max(25*1024*1024) // 25MB
  })).max(10).optional(),
  agreeTerms: z.literal(true),  // 必須同意
});

export type NeedExpandedInput = z.infer<typeof needExpandedSchema>;
