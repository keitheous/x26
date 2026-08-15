import { z } from 'zod';
import { MembershipLevel } from '../../domain/membership';

const membershipLevelSchema = z
  .enum(['SILVER', 'GOLD', 'PLATINUM'])
  .transform((level) => MembershipLevel[level]);

export const createPassengerSchema = z.object({
  name: z.string().min(1),
  membershipLevel: membershipLevelSchema,
});

export type CreatePassengerBody = z.infer<typeof createPassengerSchema>;
