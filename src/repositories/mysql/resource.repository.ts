import type { RowDataPacket } from 'mysql2/promise';
import { MembershipLevel } from '../../domain/membership';
import type { ResourceCategory } from '../../domain/resource-category';
import type { Resource } from '../interfaces';

interface ResourceRow extends RowDataPacket {
  id: number;
  name: string;
  category: ResourceCategory;
  minimum_level: keyof typeof MembershipLevel;
  capacity: number;
  status: 'ACTIVE' | 'DECOMMISSIONED';
  provisioned_by_crew_lead_id: number;
  created_at: Date;
}

export function toResource(row: ResourceRow): Resource {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    minimumLevel: MembershipLevel[row.minimum_level],
    capacity: row.capacity,
    status: row.status,
    provisionedByCrewLeadId: row.provisioned_by_crew_lead_id,
    createdAt: row.created_at,
  };
}