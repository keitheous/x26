import { createResourceService } from '../../src/services/resource.service';
import { NotFoundError } from '../../src/domain/errors';
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
      decommission: jest.fn(),
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
      decommission: jest.fn(),
    };
    const service = createResourceService(resourceRepository);

    const accessible = await service.listAccessibleResources(MembershipLevel.GOLD);

    expect(accessible).toEqual([silverResource]);
  });

  it('decommissions a resource that exists', async () => {
    const existingResource: Resource = {
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
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(existingResource),
      listActive: jest.fn(),
      decommission: jest.fn(),
    };
    const service = createResourceService(resourceRepository);

    await service.decommissionResource(1);

    expect(resourceRepository.decommission).toHaveBeenCalledWith(1);
  });

  it('throws NotFoundError when decommissioning a resource that does not exist', async () => {
    const resourceRepository: ResourceRepository = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(null),
      listActive: jest.fn(),
      decommission: jest.fn(),
    };
    const service = createResourceService(resourceRepository);

    await expect(service.decommissionResource(999)).rejects.toThrow(NotFoundError);
    expect(resourceRepository.decommission).not.toHaveBeenCalled();
  });
});
