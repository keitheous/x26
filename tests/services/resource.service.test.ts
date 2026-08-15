import { createResourceService } from '../../src/services/resource.service';
import { MembershipLevel } from '../../src/domain/membership';
import { ResourceCategory } from '../../src/domain/resource-category';
import type { Resource, ResourceRepository } from '../../src/repositories/interfaces';

describe('Resource Service', () => {
  it('passes the new resource straight through to the repository', async () => {
    const createdResource: Resource = {
      id: 1,
      name: 'Sleeping Pod A1',
      category: ResourceCategory.SLEEPING_POD,
      minimumLevel: MembershipLevel.SILVER,
      capacity: 4,
      status: 'ACTIVE',
      provisionedByCrewLeadId: 1,
      createdAt: new Date('2026-01-01T00:00:00Z'),
    };
    const resourceRepository: ResourceRepository = {
      create: jest.fn().mockResolvedValue(createdResource),
      findById: jest.fn(),
      listActive: jest.fn(),
    };
    const service = createResourceService(resourceRepository);

    const input = {
      name: 'Sleeping Pod A1',
      category: ResourceCategory.SLEEPING_POD,
      minimumLevel: MembershipLevel.SILVER,
      capacity: 4,
      provisionedByCrewLeadId: 1,
    };
    const result = await service.createResource(input);

    expect(result).toBe(createdResource);
    expect(resourceRepository.create).toHaveBeenCalledWith(input);
  });

  it('only shows a GOLD passenger the resources their tier actually reaches', async () => {
    const silverResource: Resource = {
      id: 1,
      name: 'Sleeping Pod A1',
      category: ResourceCategory.SLEEPING_POD,
      minimumLevel: MembershipLevel.SILVER,
      capacity: 4,
      status: 'ACTIVE',
      provisionedByCrewLeadId: 1,
      createdAt: new Date('2026-01-01T00:00:00Z'),
    };
    const platinumResource: Resource = {
      id: 2,
      name: 'Luxury O2 Pods',
      category: ResourceCategory.OXYGEN_UNIT,
      minimumLevel: MembershipLevel.PLATINUM,
      capacity: 2,
      status: 'ACTIVE',
      provisionedByCrewLeadId: 1,
      createdAt: new Date('2026-01-01T00:00:00Z'),
    };
    const resourceRepository: ResourceRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      listActive: jest.fn().mockResolvedValue([silverResource, platinumResource]),
    };
    const service = createResourceService(resourceRepository);

    const accessible = await service.listAccessibleResources(MembershipLevel.GOLD);

    expect(accessible).toEqual([silverResource]);
  });
});
