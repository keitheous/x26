import type { RowDataPacket } from 'mysql2/promise';
import { MembershipLevel } from '../../domain/membership';
import type { Passenger } from '../interfaces';

interface PassengerRow extends RowDataPacket {
  id: number;
  name: string;
  membership_level: keyof typeof MembershipLevel;
  status: 'ACTIVE' | 'INACTIVE';
  api_key_hash: string;
  created_by_crew_lead_id: number;
  created_at: Date;
}

export function toPassenger(row: PassengerRow): Passenger {
  return {
    id: row.id,
    name: row.name,
    membershipLevel: MembershipLevel[row.membership_level],
    status: row.status,
    apiKeyHash: row.api_key_hash,
    createdByCrewLeadId: row.created_by_crew_lead_id,
    createdAt: row.created_at,
  };
}