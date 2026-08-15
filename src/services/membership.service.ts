import { NotFoundError } from '../domain/errors';
import type { MembershipLevel } from '../domain/membership';
import type { MembershipChangeRepository, Passenger, PassengerRepository } from '../repositories/interfaces';

export function createMembershipService(deps: {
  passengerRepository: PassengerRepository;
  membershipChangeRepository: MembershipChangeRepository;
}) {
  return {
    async updateMembership(
      passengerId: number,
      toLevel: MembershipLevel,
      changedByCrewLeadId: number,
    ): Promise<Passenger> {
      const passenger = await deps.passengerRepository.findById(passengerId);
      if (!passenger) {
        throw new NotFoundError('Passenger not found');
      }

      await deps.passengerRepository.updateMembershipLevel(passengerId, toLevel);
      await deps.membershipChangeRepository.create({
        passengerId,
        fromLevel: passenger.membershipLevel,
        toLevel,
        changedByCrewLeadId,
      });

      return { ...passenger, membershipLevel: toLevel };
    },
  };
}

export type MembershipService = ReturnType<typeof createMembershipService>;
