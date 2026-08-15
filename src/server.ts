import { createApp } from './http/app';
import { env } from './config/env';
import { logger } from './config/logger';
import { pool } from './config/db';
import { createMysqlCrewLeadRepository } from './repositories/mysql/crew-lead.repository';
import { createMysqlPassengerRepository } from './repositories/mysql/passenger.repository';
import { createMysqlResourceRepository } from './repositories/mysql/resource.repository';
import { createMysqlMembershipChangeRepository } from './repositories/mysql/membership-change.repository';
import { createAuthService } from './services/auth.service';
import { createPassengerService } from './services/passenger.service';
import { createResourceService } from './services/resource.service';
import { createMembershipService } from './services/membership.service';
import { seedCrewLeads } from './bootstrap';

async function main(): Promise<void> {
  const crewLeadRepository = createMysqlCrewLeadRepository(pool);
  const passengerRepository = createMysqlPassengerRepository(pool);
  const resourceRepository = createMysqlResourceRepository(pool);
  const membershipChangeRepository = createMysqlMembershipChangeRepository(pool);
  const resolvePrincipal = createAuthService({ crewLeadRepository, passengerRepository });

  const passengerService = createPassengerService(passengerRepository);
  const resourceService = createResourceService(resourceRepository);
  const membershipService = createMembershipService({ passengerRepository, membershipChangeRepository });

  await seedCrewLeads(crewLeadRepository);

  const app = createApp({ passengerService, resourceService, membershipService, resolvePrincipal });
  app.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT}`);
  });
}

main();
