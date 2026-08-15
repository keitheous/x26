import { createPassengerService } from '../../src/services/passenger.service';
import { NotFoundError } from '../../src/domain/errors';
import { MembershipLevel } from '../../src/domain/membership';
import { hashApiKey } from '../../src/domain/api-key';
import type { Passenger, PassengerRepository } from '../../src/repositories/interfaces';

describe('Passenger Service', () => {
  it('saves the passenger with a hashed key', async () => {
    const createdPassenger: Passenger = {
      id: 1,
      name: 'John Wick',
      membershipLevel: MembershipLevel.GOLD,
      status: 'ACTIVE',
      createdByCrewLeadId: 1,
      createdAt: new Date('2026-01-01T00:00:00Z'),
    };
    const passengerRepository: PassengerRepository = {
      create: jest.fn().mockResolvedValue(createdPassenger),
      findById: jest.fn(),
      findByApiKeyHash: jest.fn(),
      list: jest.fn(),
      deactivate: jest.fn(),
      updateMembershipLevel: jest.fn(),
    };
    const service = createPassengerService(passengerRepository);

    const { passenger, apiKey } = await service.createPassenger({
      name: 'John Wick',
      membershipLevel: MembershipLevel.GOLD,
      createdByCrewLeadId: 1,
    });

    expect(passenger).toBe(createdPassenger);
    expect(passengerRepository.create).toHaveBeenCalledWith({
      name: 'John Wick',
      membershipLevel: MembershipLevel.GOLD,
      apiKeyHash: hashApiKey(apiKey),
      createdByCrewLeadId: 1,
    });
  });

  it('returns passenger list correctly', async () => {
    const passengers: Passenger[] = [
      {
        id: 1,
        name: 'John Wick',
        membershipLevel: MembershipLevel.SILVER,
        status: 'ACTIVE',
        createdByCrewLeadId: 1,
        createdAt: new Date('2026-01-01T00:00:00Z'),
      },
    ];
    const passengerRepository: PassengerRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByApiKeyHash: jest.fn(),
      list: jest.fn().mockResolvedValue(passengers),
      deactivate: jest.fn(),
      updateMembershipLevel: jest.fn(),
    };
    const service = createPassengerService(passengerRepository);

    await expect(service.listPassengers()).resolves.toBe(passengers);
  });

  it('deactivates a passenger that exists', async () => {
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
    const service = createPassengerService(passengerRepository);

    await service.deactivatePassenger(1);

    expect(passengerRepository.deactivate).toHaveBeenCalledWith(1);
  });

  it('throws NotFoundError when deactivating a passenger that does not exist', async () => {
    const passengerRepository: PassengerRepository = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(null),
      findByApiKeyHash: jest.fn(),
      list: jest.fn(),
      deactivate: jest.fn(),
      updateMembershipLevel: jest.fn(),
    };
    const service = createPassengerService(passengerRepository);

    await expect(service.deactivatePassenger(999)).rejects.toThrow(NotFoundError);
    expect(passengerRepository.deactivate).not.toHaveBeenCalled();
  });
});
