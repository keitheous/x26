import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { MembershipLevel } from '../../domain/membership';
import type { NewUsageLog, UsageLogRepository } from '../interfaces';

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
  };
}
