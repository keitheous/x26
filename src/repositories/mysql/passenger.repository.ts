import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { MembershipLevel } from '../../domain/membership';
import type { NewPassenger, Passenger, PassengerRepository } from '../interfaces';

interface PassengerRow extends RowDataPacket {
  id: number;
  name: string;
  membership_level: keyof typeof MembershipLevel;
  status: 'ACTIVE' | 'INACTIVE';
  api_key_hash: string;
  created_by_crew_lead_id: number;
  created_at: Date;
}

function toPassenger(row: PassengerRow): Passenger {
  return {
    id: row.id,
    name: row.name,
    membershipLevel: MembershipLevel[row.membership_level],
    status: row.status,
    createdByCrewLeadId: row.created_by_crew_lead_id,
    createdAt: row.created_at,
  };
}

export function createMysqlPassengerRepository(pool: Pool): PassengerRepository {
  return {
    async create(input: NewPassenger) {
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO passengers (name, membership_level, api_key_hash, created_by_crew_lead_id)
         VALUES (?, ?, ?, ?)`,
        [
          input.name,
          MembershipLevel[input.membershipLevel],
          input.apiKeyHash,
          input.createdByCrewLeadId,
        ],
      );
      return {
        id: result.insertId,
        name: input.name,
        membershipLevel: input.membershipLevel,
        status: 'ACTIVE',
        createdByCrewLeadId: input.createdByCrewLeadId,
        createdAt: new Date(),
      };
    },

    async findById(id) {
      const [rows] = await pool.execute<PassengerRow[]>('SELECT * FROM passengers WHERE id = ?', [
        id,
      ]);
      return rows[0] ? toPassenger(rows[0]) : null;
    },

    async findByApiKeyHash(apiKeyHash) {
      const [rows] = await pool.execute<PassengerRow[]>(
        'SELECT * FROM passengers WHERE api_key_hash = ?',
        [apiKeyHash],
      );
      return rows[0] ? toPassenger(rows[0]) : null;
    },

    async list() {
      const [rows] = await pool.execute<PassengerRow[]>('SELECT * FROM passengers ORDER BY id');
      return rows.map(toPassenger);
    },

    async deactivate(id) {
      await pool.execute("UPDATE passengers SET status = 'INACTIVE' WHERE id = ?", [id]);
    },

    async updateMembershipLevel(id, level) {
      await pool.execute('UPDATE passengers SET membership_level = ? WHERE id = ?', [
        MembershipLevel[level],
        id,
      ]);
    },
  };
}
