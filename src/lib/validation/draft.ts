import { z } from 'zod';

export const DraftSchema = z.object({
  kind: z.enum(['need', 'vendor']),
  payload: z.unknown(),
  updatedAt: z.date()
});

export type DraftInput = z.infer<typeof DraftSchema>;
