import { z } from 'zod';

export const createUsageSchema = z.object({
  resourceId: z.number().int().positive(),
});

export type CreateUsageBody = z.infer<typeof createUsageSchema>;
