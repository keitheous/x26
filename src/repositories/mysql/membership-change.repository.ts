import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { MembershipLevel } from '../../domain/membership';
import type { MembershipChangeRepository, NewMembershipChange } from '../interfaces';

export function createMysqlMembershipChangeRepository(pool: Pool): MembershipChangeRepository {
  return {
    async create(input: NewMembershipChange) {
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO membership_changes (passenger_id, from_level, to_level, changed_by_crew_lead_id)
         VALUES (?, ?, ?, ?)`,
        [
          input.passengerId,
          MembershipLevel[input.fromLevel],
          MembershipLevel[input.toLevel],
          input.changedByCrewLeadId,
        ],
      );
      return {
        id: result.insertId,
        passengerId: input.passengerId,
        fromLevel: input.fromLevel,
        toLevel: input.toLevel,
        changedByCrewLeadId: input.changedByCrewLeadId,
        changedAt: new Date(),
      };
    },
  };
}
