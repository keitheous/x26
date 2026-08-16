import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { MembershipLevel } from '../../domain/membership';
import type {
  NewUsageLog,
  ResourceDemand,
  UsageByLevel,
  UsageLog,
  UsageLogRepository,
} from '../interfaces';

interface UsageByLevelRow extends RowDataPacket {
  passenger_level_at_use: keyof typeof MembershipLevel;
  granted: number | string;
  denied: number | string;
}

function toUsageByLevel(row: UsageByLevelRow): UsageByLevel {
  return {
    level: MembershipLevel[row.passenger_level_at_use],
    granted: Number(row.granted),
    denied: Number(row.denied),
  };
}

interface ResourceDemandRow extends RowDataPacket {
  resource_id: number;
  resource_name: string;
  attempts: number | string;
  granted: number | string;
}

function toResourceDemand(row: ResourceDemandRow): ResourceDemand {
  return {
    resourceId: row.resource_id,
    resourceName: row.resource_name,
    attempts: Number(row.attempts),
    granted: Number(row.granted),
  };
}

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
      const [rows] = await pool.query<UsageLogRow[]>(
        'SELECT * FROM usage_log WHERE passenger_id = ? ORDER BY occurred_at DESC LIMIT ?',
        [passengerId, limit],
      );
      return rows.map(toUsageLog);
    },

    async aggregateByLevel() {
      const [rows] = await pool.execute<UsageByLevelRow[]>(
        `SELECT
           passenger_level_at_use,
           SUM(outcome = 'GRANTED') AS granted,
           SUM(outcome = 'DENIED') AS denied
         FROM usage_log
         GROUP BY passenger_level_at_use`,
      );
      return rows.map(toUsageByLevel);
    },

    async aggregateResourceDemand(limit) {
      const [rows] = await pool.query<ResourceDemandRow[]>(
        `SELECT
           ul.resource_id,
           r.name AS resource_name,
           COUNT(*) AS attempts,
           SUM(ul.outcome = 'GRANTED') AS granted
         FROM usage_log ul
         JOIN resources r ON r.id = ul.resource_id
         GROUP BY ul.resource_id, r.name
         ORDER BY attempts DESC
         LIMIT ?`,
        [limit],
      );
      return rows.map(toResourceDemand);
    },
  };
}
