import { z } from 'zod';

export const ProposalCreateSchema = z.object({
  needId: z.string(), // UUIDフォーマットはDB側でチェックでもOK
  message: z.string().min(10).max(4000),
  estimate: z.number().int().min(0).max(10_000_000).optional(),
});
