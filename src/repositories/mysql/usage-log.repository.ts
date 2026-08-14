import type { RowDataPacket } from 'mysql2/promise';
import { MembershipLevel } from '../../domain/membership';
import type {
  UsageLog,
  UsageOutcome,
} from '../interfaces';

interface UsageLogRow extends RowDataPacket {
  id: number;
  passenger_id: number;
  resource_id: number;
  passenger_level_at_use: keyof typeof MembershipLevel;
  resource_min_level_at_use: keyof typeof MembershipLevel;
  outcome: UsageOutcome;
  denial_reason: string | null;
  occurred_at: Date;
}

export function toUsageLog(row: UsageLogRow): UsageLog {
  return {
    id: row.id,
    passengerId: row.passenger_id,
    resourceId: row.resource_id,
    passengerLevelAtUse: MembershipLevel[row.passenger_level_at_use],
    resourceMinLevelAtUse: MembershipLevel[row.resource_min_level_at_use],
    outcome: row.outcome,
    denialReason: row.denial_reason,
    occurredAt: row.occurred_at,
  };
}
