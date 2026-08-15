import { createPassengerService } from '../../src/services/passenger.service';
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
    };
    const service = createPassengerService(passengerRepository);

    await expect(service.listPassengers()).resolves.toBe(passengers);
  });
});
