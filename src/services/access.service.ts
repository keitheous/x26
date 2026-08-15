import { canAccess } from '../domain/membership';
import { ForbiddenError, NotFoundError } from '../domain/errors';
import type { MembershipLevel } from '../domain/membership';
import type { ResourceRepository, UsageLogRepository } from '../repositories/interfaces';

export interface ValidateUsageInput {
  passengerId: number;
  passengerLevel: MembershipLevel;
  resourceId: number;
}

export function createAccessService(deps: {
  resourceRepository: ResourceRepository;
  usageLogRepository: UsageLogRepository;
}) {
  return {
    async validateUsage(input: ValidateUsageInput): Promise<void> {
      const resource = await deps.resourceRepository.findById(input.resourceId);
      if (!resource) {
        throw new NotFoundError('Resource not found');
      }

      if (resource.status === 'DECOMMISSIONED') {
        await deps.usageLogRepository.create({
          passengerId: input.passengerId,
          resourceId: input.resourceId,
          passengerLevelAtUse: input.passengerLevel,
          resourceMinLevelAtUse: resource.minimumLevel,
          outcome: 'DENIED',
          denialReason: 'Resource has been decommissioned',
        });
        throw new ForbiddenError('Resource has been decommissioned');
      }

      const granted = canAccess(input.passengerLevel, resource.minimumLevel);
      await deps.usageLogRepository.create({
        passengerId: input.passengerId,
        resourceId: input.resourceId,
        passengerLevelAtUse: input.passengerLevel,
        resourceMinLevelAtUse: resource.minimumLevel,
        outcome: granted ? 'GRANTED' : 'DENIED',
        denialReason: granted ? null : 'Membership level does not meet the resource minimum',
      });

      if (!granted) {
        throw new ForbiddenError('Membership level does not meet the resource minimum');
      }
    },
  };
}

export type AccessService = ReturnType<typeof createAccessService>;
