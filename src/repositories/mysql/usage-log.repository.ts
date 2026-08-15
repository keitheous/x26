import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { MembershipLevel } from '../../domain/membership';
import type { NewUsageLog, UsageLog, UsageLogRepository } from '../interfaces';

interface UsageLogRow extends RowDataPacket {
  id: number;
  passenger_id: number;
  resource_id: number;
  passenger_level_at_use: keyof typeof MembershipLevel;
  resource_min_level_at_use: keyof typeof MembershipLevel;
  outcome: 'GRANTED' | 'DENIED';
  denial_reason: string | null;
  occurred_at: Date;
}

function toUsageLog(row: UsageLogRow): UsageLog {
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

export function createMysqlUsageLogRepository(pool: Pool): UsageLogRepository {
  return {
    async create(input: NewUsageLog) {
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO usage_log
           (passenger_id, resource_id, passenger_level_at_use, resource_min_level_at_use, outcome, denial_reason)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          input.passengerId,
          input.resourceId,
          MembershipLevel[input.passengerLevelAtUse],
          MembershipLevel[input.resourceMinLevelAtUse],
          input.outcome,
          input.denialReason,
        ],
      );
      return {
        id: result.insertId,
        passengerId: input.passengerId,
        resourceId: input.resourceId,
        passengerLevelAtUse: input.passengerLevelAtUse,
        resourceMinLevelAtUse: input.resourceMinLevelAtUse,
        outcome: input.outcome,
        denialReason: input.denialReason,
        occurredAt: new Date(),
      };
    },

    async findByPassenger(passengerId, limit) {
      const [rows] = await pool.execute<UsageLogRow[]>(
        'SELECT * FROM usage_log WHERE passenger_id = ? ORDER BY occurred_at DESC LIMIT ?',
        [passengerId, limit],
      );
      return rows.map(toUsageLog);
    },
  };
}
