import { z } from 'zod';
import { membershipLevelSchema } from './membership-level.schema';

export const createPassengerSchema = z.object({
  name: z.string().min(1),
  membershipLevel: membershipLevelSchema,
});

export type CreatePassengerBody = z.infer<typeof createPassengerSchema>;
