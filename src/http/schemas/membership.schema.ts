import { z } from 'zod';
import { membershipLevelSchema } from './membership-level.schema';

export const updateMembershipSchema = z.object({
  membershipLevel: membershipLevelSchema,
});

export type UpdateMembershipBody = z.infer<typeof updateMembershipSchema>;
