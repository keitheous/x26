import type { RowDataPacket } from 'mysql2/promise';
import { MembershipLevel } from '../../domain/membership';
import type { MembershipChange } from '../interfaces';

interface MembershipChangeRow extends RowDataPacket {
  id: number;
  passenger_id: number;
  from_level: keyof typeof MembershipLevel;
  to_level: keyof typeof MembershipLevel;
  changed_by_crew_lead_id: number;
  changed_at: Date;
}

export function toMembershipChange(row: MembershipChangeRow): MembershipChange {
  return {
    id: row.id,
    passengerId: row.passenger_id,
    fromLevel: MembershipLevel[row.from_level],
    toLevel: MembershipLevel[row.to_level],
    changedByCrewLeadId: row.changed_by_crew_lead_id,
    changedAt: row.changed_at,
  };
}