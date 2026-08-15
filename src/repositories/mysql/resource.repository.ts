import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { MembershipLevel } from '../../domain/membership';
import type { ResourceCategory } from '../../domain/resource-category';
import type { NewResource, Resource, ResourceRepository } from '../interfaces';

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

function toResource(row: ResourceRow): Resource {
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

export function createMysqlResourceRepository(pool: Pool): ResourceRepository {
  return {
    async create(input: NewResource) {
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO resources (name, category, minimum_level, capacity, provisioned_by_crew_lead_id)
         VALUES (?, ?, ?, ?, ?)`,
        [
          input.name,
          input.category,
          MembershipLevel[input.minimumLevel],
          input.capacity,
          input.provisionedByCrewLeadId,
        ],
      );
      return {
        id: result.insertId,
        name: input.name,
        category: input.category,
        minimumLevel: input.minimumLevel,
        capacity: input.capacity,
        status: 'ACTIVE',
        provisionedByCrewLeadId: input.provisionedByCrewLeadId,
        createdAt: new Date(),
      };
    },

    async findById(id) {
      const [rows] = await pool.execute<ResourceRow[]>('SELECT * FROM resources WHERE id = ?', [id]);
      return rows[0] ? toResource(rows[0]) : null;
    },

    async listActive() {
      const [rows] = await pool.execute<ResourceRow[]>(
        "SELECT * FROM resources WHERE status = 'ACTIVE' ORDER BY id",
      );
      return rows.map(toResource);
    },
  };
}