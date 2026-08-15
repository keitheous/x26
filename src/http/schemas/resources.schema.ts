import { z } from 'zod';
import { ResourceCategory } from '../../domain/resource-category';
import { membershipLevelSchema } from './membership-level.schema';

export const createResourceSchema = z.object({
  name: z.string().min(1),
  category: z.nativeEnum(ResourceCategory),
  minimumLevel: membershipLevelSchema,
  capacity: z.number().int().min(0),
});

export type CreateResourceBody = z.infer<typeof createResourceSchema>;
