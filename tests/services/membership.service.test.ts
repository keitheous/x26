import { createMembershipService } from '../../src/services/membership.service';
import { NotFoundError } from '../../src/domain/errors';
import { MembershipLevel } from '../../src/domain/membership';
import type {
  MembershipChangeRepository,
  Passenger,
  PassengerRepository,
} from '../../src/repositories/interfaces';

describe('Membership Service', () => {
  it('upgrades a passenger and writes down the old and new level', async () => {
    const existingPassenger: Passenger = {
      id: 1,
      name: 'John Wick',
      membershipLevel: MembershipLevel.SILVER,
      status: 'ACTIVE',
      createdByCrewLeadId: 1,
      createdAt: new Date('2026-01-01T00:00:00Z'),
    };
    const passengerRepository: PassengerRepository = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(existingPassenger),
      findByApiKeyHash: jest.fn(),
      list: jest.fn(),
      deactivate: jest.fn(),
      updateMembershipLevel: jest.fn(),
    };
    const membershipChangeRepository: MembershipChangeRepository = {
      create: jest.fn(),
    };
    const service = createMembershipService({ passengerRepository, membershipChangeRepository });

    const updated = await service.updateMembership(1, MembershipLevel.GOLD, 2);

    expect(updated.membershipLevel).toBe(MembershipLevel.GOLD);
    expect(passengerRepository.updateMembershipLevel).toHaveBeenCalledWith(1, MembershipLevel.GOLD);
    expect(membershipChangeRepository.create).toHaveBeenCalledWith({
      passengerId: 1,
      fromLevel: MembershipLevel.SILVER,
      toLevel: MembershipLevel.GOLD,
      changedByCrewLeadId: 2,
    });
  });

  it('downgrades a passenger the same way', async () => {
    const existingPassenger: Passenger = {
      id: 1,
      name: 'John Wick',
      membershipLevel: MembershipLevel.PLATINUM,
      status: 'ACTIVE',
      createdByCrewLeadId: 1,
      createdAt: new Date('2026-01-01T00:00:00Z'),
    };
    const passengerRepository: PassengerRepository = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(existingPassenger),
      findByApiKeyHash: jest.fn(),
      list: jest.fn(),
      deactivate: jest.fn(),
      updateMembershipLevel: jest.fn(),
    };
    const membershipChangeRepository: MembershipChangeRepository = {
      create: jest.fn(),
    };
    const service = createMembershipService({ passengerRepository, membershipChangeRepository });

    const updated = await service.updateMembership(1, MembershipLevel.SILVER, 2);

    expect(updated.membershipLevel).toBe(MembershipLevel.SILVER);
    expect(membershipChangeRepository.create).toHaveBeenCalledWith({
      passengerId: 1,
      fromLevel: MembershipLevel.PLATINUM,
      toLevel: MembershipLevel.SILVER,
      changedByCrewLeadId: 2,
    });
  });

  it('throws NotFoundError when the passenger does not exist', async () => {
    const passengerRepository: PassengerRepository = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(null),
      findByApiKeyHash: jest.fn(),
      list: jest.fn(),
      deactivate: jest.fn(),
      updateMembershipLevel: jest.fn(),
    };
    const membershipChangeRepository: MembershipChangeRepository = {
      create: jest.fn(),
    };
    const service = createMembershipService({ passengerRepository, membershipChangeRepository });

    await expect(service.updateMembership(999, MembershipLevel.GOLD, 2)).rejects.toThrow(NotFoundError);
    expect(passengerRepository.updateMembershipLevel).not.toHaveBeenCalled();
    expect(membershipChangeRepository.create).not.toHaveBeenCalled();
  });
});
