import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { ConflictError } from '../../domain/errors';
import type { CrewLead, CrewLeadRepository, NewCrewLead } from '../interfaces';

interface CrewLeadRow extends RowDataPacket {
  id: number;
  name: string;
  api_key_hash: string;
  slot: number;
  created_at: Date;
}

function toCrewLead(row: CrewLeadRow): CrewLead {
  return {
    id: row.id,
    name: row.name,
    apiKeyHash: row.api_key_hash,
    slot: row.slot,
    createdAt: row.created_at,
  };
}

export function createMysqlCrewLeadRepository(pool: Pool): CrewLeadRepository {
  return {
    async findByApiKeyHash(apiKeyHash) {
      const [rows] = await pool.execute<CrewLeadRow[]>('SELECT * FROM crew_leads WHERE api_key_hash = ?', [
        apiKeyHash,
      ]);
      return rows[0] ? toCrewLead(rows[0]) : null;
    },

    async createWithNextSlot(input: NewCrewLead) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [countRows] = await connection.execute<RowDataPacket[]>(
          'SELECT COUNT(*) AS count FROM crew_leads FOR UPDATE',
        );
        const count = Number((countRows[0] as { count: number }).count);
        if (count >= 3) {
          throw new ConflictError('Crew Lead limit of 3 reached', 'CREW_LEAD_LIMIT_REACHED');
        }
        const slot = count + 1;
        const [result] = await connection.execute<ResultSetHeader>(
          'INSERT INTO crew_leads (name, api_key_hash, slot) VALUES (?, ?, ?)',
          [input.name, input.apiKeyHash, slot],
        );
        await connection.commit();
        return {
          id: result.insertId,
          name: input.name,
          apiKeyHash: input.apiKeyHash,
          slot,
          createdAt: new Date(),
        };
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    },
  };
}