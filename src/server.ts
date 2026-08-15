import { createApp } from './http/app';
import { env } from './config/env';
import { logger } from './config/logger';
import { pool } from './config/db';
import { createMysqlCrewLeadRepository } from './repositories/mysql/crew-lead.repository';
import { createMysqlPassengerRepository } from './repositories/mysql/passenger.repository';
import { createAuthService } from './services/auth.service';
import { createPassengerService } from './services/passenger.service';
import { seedCrewLeads } from './bootstrap';

async function main(): Promise<void> {
  const crewLeadRepository = createMysqlCrewLeadRepository(pool);
  const passengerRepository = createMysqlPassengerRepository(pool);
  const resolvePrincipal = createAuthService({ crewLeadRepository, passengerRepository });
  const passengerService = createPassengerService(passengerRepository);

  await seedCrewLeads(crewLeadRepository);

  const app = createApp({ passengerService, resolvePrincipal });
  app.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT}`);
  });
}

main();
