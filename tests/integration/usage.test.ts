import request from 'supertest';
import { createApp } from '../../src/http/app';
import { pool } from '../../src/config/db';
import { createMysqlCrewLeadRepository } from '../../src/repositories/mysql/crew-lead.repository';
import { createMysqlPassengerRepository } from '../../src/repositories/mysql/passenger.repository';
import { createMysqlResourceRepository } from '../../src/repositories/mysql/resource.repository';
import { createMysqlUsageLogRepository } from '../../src/repositories/mysql/usage-log.repository';
import { createMysqlMembershipChangeRepository } from '../../src/repositories/mysql/membership-change.repository';
import { createAuthService } from '../../src/services/auth.service';
import { createPassengerService } from '../../src/services/passenger.service';
import { createResourceService } from '../../src/services/resource.service';
import { createMembershipService } from '../../src/services/membership.service';
import { createAccessService } from '../../src/services/access.service';
import { createReportingService } from '../../src/services/reporting.service';
import { generateApiKey, hashApiKey } from '../../src/domain/api-key';
import { MembershipLevel } from '../../src/domain/membership';
import { ResourceCategory } from '../../src/domain/resource-category';

describe('Usage integration', () => {
  const crewLeadRepository = createMysqlCrewLeadRepository(pool);
  const passengerRepository = createMysqlPassengerRepository(pool);
  const resourceRepository = createMysqlResourceRepository(pool);
  const usageLogRepository = createMysqlUsageLogRepository(pool);
  const membershipChangeRepository = createMysqlMembershipChangeRepository(pool);

  const app = createApp({
    passengerService: createPassengerService(passengerRepository),
    resourceService: createResourceService(resourceRepository),
    membershipService: createMembershipService({ passengerRepository, membershipChangeRepository }),
    accessService: createAccessService({ resourceRepository, usageLogRepository }),
    reportingService: createReportingService(usageLogRepository),
    resolvePrincipal: createAuthService({ crewLeadRepository, passengerRepository }),
  });

  let crewLeadApiKey: string;

  beforeAll(async () => {
    await pool.execute('DELETE FROM usage_log');
    await pool.execute('DELETE FROM membership_changes');
    await pool.execute('DELETE FROM passengers');
    await pool.execute('DELETE FROM resources');
    await pool.execute('DELETE FROM crew_leads');

    crewLeadApiKey = generateApiKey();
    await crewLeadRepository.createWithNextSlot({
      name: 'Test Crew Lead',
      apiKeyHash: hashApiKey(crewLeadApiKey),
    });
  });

  afterAll(async () =>  await pool.end());

  async function createPassenger(membershipLevel: MembershipLevel) {
    const response = await request(app)
      .post('/passengers')
      .set('Authorization', `Bearer ${crewLeadApiKey}`)
      .send({ name: 'Test Passenger', membershipLevel: MembershipLevel[membershipLevel] });
    return { id: response.body.id as number, apiKey: response.body.apiKey as string };
  }

  async function createResource(minimumLevel: MembershipLevel) {
    const response = await request(app)
      .post('/resources')
      .set('Authorization', `Bearer ${crewLeadApiKey}`)
      .send({
        name: `Resource ${Date.now()}-${Math.random()}`,
        category: ResourceCategory.SLEEPING_POD,
        minimumLevel: MembershipLevel[minimumLevel],
        capacity: 1,
      });
    return response.body.id as number;
  }

  it('grants access and records it in the passenger usage history', async () => {
    const passenger = await createPassenger(MembershipLevel.GOLD);
    const resourceId = await createResource(MembershipLevel.SILVER);

    const usageResponse = await request(app)
      .post(`/passengers/${passenger.id}/usage`)
      .set('Authorization', `Bearer ${passenger.apiKey}`)
      .send({ resourceId });

    expect(usageResponse.status).toBe(201);

    const historyResponse = await request(app)
      .get(`/passengers/${passenger.id}/usage`)
      .set('Authorization', `Bearer ${passenger.apiKey}`);

    expect(historyResponse.status).toBe(200);
    expect(historyResponse.body).toHaveLength(1);
    expect(historyResponse.body[0]).toMatchObject({
      resourceId,
      outcome: 'GRANTED',
      denialReason: null,
    });
  });

  it('denies access when the tier is too low, and still records the denial', async () => {
    const passenger = await createPassenger(MembershipLevel.SILVER);
    const resourceId = await createResource(MembershipLevel.PLATINUM);

    const usageResponse = await request(app)
      .post(`/passengers/${passenger.id}/usage`)
      .set('Authorization', `Bearer ${passenger.apiKey}`)
      .send({ resourceId });

    expect(usageResponse.status).toBe(403);

    const historyResponse = await request(app)
      .get(`/passengers/${passenger.id}/usage`)
      .set('Authorization', `Bearer ${passenger.apiKey}`);

    expect(historyResponse.body).toHaveLength(1);
    expect(historyResponse.body[0].outcome).toBe('DENIED');
    expect(historyResponse.body[0].denialReason).toEqual(expect.any(String));
  });

  it('forbids a passenger from viewing another passenger resources', async () => {
    const passengerA = await createPassenger(MembershipLevel.GOLD);
    const passengerB = await createPassenger(MembershipLevel.GOLD);

    const response = await request(app)
      .get(`/passengers/${passengerB.id}/resources`)
      .set('Authorization', `Bearer ${passengerA.apiKey}`);

    expect(response.status).toBe(403);
  });
});
