import { z } from "zod";
export const NeedSchema = z.object({
  title: z.string().min(4).max(120),
  description: z.string().min(10).max(4000),
  area: z.string().min(1).max(80),
  budgetMin: z.number().int().min(0).max(10_000_000).optional(),
  budgetMax: z.number().int().min(0).max(10_000_000).optional(),
});
