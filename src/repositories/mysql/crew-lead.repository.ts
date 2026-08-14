import type { RowDataPacket } from 'mysql2/promise';
import type { CrewLead } from '../interfaces';

interface CrewLeadRow extends RowDataPacket {
  id: number;
  name: string;
  api_key_hash: string;
  slot: number;
  created_at: Date;
}

export function toCrewLead(row: CrewLeadRow): CrewLead {
  return {
    id: row.id,
    name: row.name,
    apiKeyHash: row.api_key_hash,
    slot: row.slot,
    createdAt: row.created_at,
  };
}