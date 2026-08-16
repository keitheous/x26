import { canAccess, type MembershipLevel } from '../domain/membership';
import { NotFoundError } from '../domain/errors';
import type { ResourceCategory } from '../domain/resource-category';
import type { Resource, ResourceRepository } from '../repositories/interfaces';

export interface CreateResourceInput {
  name: string;
  category: ResourceCategory;
  minimumLevel: MembershipLevel;
  capacity: number;
  provisionedByCrewLeadId: number;
}

export function createResourceService(resourceRepository: ResourceRepository) {
  return {
    async createResource(input: CreateResourceInput): Promise<Resource> {
      return resourceRepository.create(input);
    },

    async listAccessibleResources(passengerLevel: MembershipLevel): Promise<Resource[]> {
      const resources = await resourceRepository.listActive();
      return resources.filter((resource) => canAccess(passengerLevel, resource.minimumLevel));
    },

    async decommissionResource(id: number): Promise<void> {
      const resource = await resourceRepository.findById(id);
      if (!resource) {
        throw new NotFoundError('Resource not found');
      }
      await resourceRepository.decommission(id);
    },
  };
}

export type ResourceService = ReturnType<typeof createResourceService>;
