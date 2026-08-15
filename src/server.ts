import { createApp } from './http/app';
import { env } from './config/env';
import { logger } from './config/logger';
import { pool } from './config/db';
import { createMysqlCrewLeadRepository } from './repositories/mysql/crew-lead.repository';
import { seedCrewLeads } from './bootstrap';

async function main(): Promise<void> {
  await seedCrewLeads(createMysqlCrewLeadRepository(pool));

  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT}`);
  });
}

main();
