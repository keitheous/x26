import { createAccessService } from '../../src/services/access.service';
import { NotFoundError, ForbiddenError } from '../../src/domain/errors';
import { MembershipLevel } from '../../src/domain/membership';
import { ResourceCategory } from '../../src/domain/resource-category';
import type {
  Resource,
  ResourceRepository,
  UsageLogRepository,
} from '../../src/repositories/interfaces';

function makeResource(overrides: Partial<Resource> = {}): Resource {
  return {
    id: 1,
    name: 'Sleeping Pod A1',
    category: ResourceCategory.SLEEPING_POD,
    minimumLevel: MembershipLevel.SILVER,
    capacity: 4,
    status: 'ACTIVE',
    provisionedByCrewLeadId: 1,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

describe('Access Service', () => {
  it('grants access and logs it when the tier is high enough', async () => {
    const resource = makeResource({ minimumLevel: MembershipLevel.SILVER });
    const resourceRepository: ResourceRepository = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(resource),
      listActive: jest.fn(),
    };
    const usageLogRepository: UsageLogRepository = {
      create: jest.fn(),
      findByPassenger: jest.fn(),
      aggregateByLevel: jest.fn(),
    };
    const service = createAccessService({ resourceRepository, usageLogRepository });

    await service.validateUsage({
      passengerId: 1,
      passengerLevel: MembershipLevel.GOLD,
      resourceId: 1,
    });

    expect(usageLogRepository.create).toHaveBeenCalledWith({
      passengerId: 1,
      resourceId: 1,
      passengerLevelAtUse: MembershipLevel.GOLD,
      resourceMinLevelAtUse: MembershipLevel.SILVER,
      outcome: 'GRANTED',
      denialReason: null,
    });
  });

  it('denies access and logs it when the tier is too low', async () => {
    const resource = makeResource({ minimumLevel: MembershipLevel.PLATINUM });
    const resourceRepository: ResourceRepository = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(resource),
      listActive: jest.fn(),
    };
    const usageLogRepository: UsageLogRepository = {
      create: jest.fn(),
      findByPassenger: jest.fn(),
      aggregateByLevel: jest.fn(),
    };
    const service = createAccessService({ resourceRepository, usageLogRepository });

    await expect(
      service.validateUsage({
        passengerId: 1,
        passengerLevel: MembershipLevel.SILVER,
        resourceId: 1,
      }),
    ).rejects.toThrow(ForbiddenError);

    expect(usageLogRepository.create).toHaveBeenCalledWith({
      passengerId: 1,
      resourceId: 1,
      passengerLevelAtUse: MembershipLevel.SILVER,
      resourceMinLevelAtUse: MembershipLevel.PLATINUM,
      outcome: 'DENIED',
      denialReason: expect.any(String),
    });
  });

  it('denies access and logs it when the resource is decommissioned, even for a high enough tier', async () => {
    const resource = makeResource({
      minimumLevel: MembershipLevel.SILVER,
      status: 'DECOMMISSIONED',
    });
    const resourceRepository: ResourceRepository = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(resource),
      listActive: jest.fn(),
    };
    const usageLogRepository: UsageLogRepository = {
      create: jest.fn(),
      findByPassenger: jest.fn(),
      aggregateByLevel: jest.fn(),
    };
    const service = createAccessService({ resourceRepository, usageLogRepository });

    await expect(
      service.validateUsage({
        passengerId: 1,
        passengerLevel: MembershipLevel.PLATINUM,
        resourceId: 1,
      }),
    ).rejects.toThrow(ForbiddenError);

    expect(usageLogRepository.create).toHaveBeenCalledWith({
      passengerId: 1,
      resourceId: 1,
      passengerLevelAtUse: MembershipLevel.PLATINUM,
      resourceMinLevelAtUse: MembershipLevel.SILVER,
      outcome: 'DENIED',
      denialReason: expect.any(String),
    });
  });

  it('throws NotFoundError and never logs anything when the resource does not exist', async () => {
    const resourceRepository: ResourceRepository = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(null),
      listActive: jest.fn(),
    };
    const usageLogRepository: UsageLogRepository = {
      create: jest.fn(),
      findByPassenger: jest.fn(),
      aggregateByLevel: jest.fn(),
    };
    const service = createAccessService({ resourceRepository, usageLogRepository });

    await expect(
      service.validateUsage({
        passengerId: 1,
        passengerLevel: MembershipLevel.PLATINUM,
        resourceId: 999,
      }),
    ).rejects.toThrow(NotFoundError);

    expect(usageLogRepository.create).not.toHaveBeenCalled();
  });
});
