import { z } from 'zod';
import { MembershipLevel } from '../../domain/membership';

export const membershipLevelSchema = z
  .enum(['SILVER', 'GOLD', 'PLATINUM'])
  .transform((level) => MembershipLevel[level]);
