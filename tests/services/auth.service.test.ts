import { createAuthService } from '../../src/services/auth.service';
import { Role, MembershipLevel } from '../../src/domain/membership';
import type { CrewLead, CrewLeadRepository, Passenger, PassengerRepository } from '../../src/repositories/interfaces';

describe('Auth Services', () => {
  it('checks crew leads before falling back to passengers', async () => {
    const crewLead: CrewLead = { id: 1, name: 'Lead One', slot: 1, createdAt: new Date('2026-01-01T00:00:00Z') };
    const crewLeadRepository: CrewLeadRepository = {
      findByApiKeyHash: jest.fn().mockResolvedValue(crewLead),
      createWithNextSlot: jest.fn(),
    };
    const passengerRepository: PassengerRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByApiKeyHash: jest.fn(),
      list: jest.fn(),
      deactivate: jest.fn(),
      updateMembershipLevel: jest.fn(),
    };
    const resolvePrincipal = createAuthService({ crewLeadRepository, passengerRepository });

    await expect(resolvePrincipal('some-hash')).resolves.toEqual({ role: Role.CREW_LEAD, id: 1 });
    expect(passengerRepository.findByApiKeyHash).not.toHaveBeenCalled();
  });

  it('checks passengers if no crew lead matched the key', async () => {
    const passenger: Passenger = {
      id: 7,
      name: 'John Wick',
      membershipLevel: MembershipLevel.PLATINUM,
      status: 'ACTIVE',
      createdByCrewLeadId: 1,
      createdAt: new Date('2026-01-01T00:00:00Z'),
    };
    const crewLeadRepository: CrewLeadRepository = {
      findByApiKeyHash: jest.fn().mockResolvedValue(null),
      createWithNextSlot: jest.fn(),
    };
    const passengerRepository: PassengerRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByApiKeyHash: jest.fn().mockResolvedValue(passenger),
      list: jest.fn(),
      deactivate: jest.fn(),
      updateMembershipLevel: jest.fn(),
    };
    const resolvePrincipal = createAuthService({ crewLeadRepository, passengerRepository });

    await expect(resolvePrincipal('some-hash')).resolves.toEqual({
      role: Role.PASSENGER,
      id: 7,
      membershipLevel: MembershipLevel.PLATINUM,
    });
  });

  it("returns null if the key doesn't match anyone", async () => {
    const crewLeadRepository: CrewLeadRepository = {
      findByApiKeyHash: jest.fn().mockResolvedValue(null),
      createWithNextSlot: jest.fn(),
    };
    const passengerRepository: PassengerRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByApiKeyHash: jest.fn().mockResolvedValue(null),
      list: jest.fn(),
      deactivate: jest.fn(),
      updateMembershipLevel: jest.fn(),
    };
    const resolvePrincipal = createAuthService({ crewLeadRepository, passengerRepository });

    await expect(resolvePrincipal('unknown-hash')).resolves.toBeNull();
  });
});
