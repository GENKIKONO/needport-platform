import { z } from 'zod';

export const NeedCreateSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(4000),
  category: z.string().min(1).max(50),
  area: z.string().min(1).max(50),
});
