import { Role } from '../domain/membership';
import type { PrincipalResolver } from '../http/middleware/authenticate';
import type { CrewLeadRepository, PassengerRepository } from '../repositories/interfaces';

export function createAuthService(deps: {
  crewLeadRepository: CrewLeadRepository;
  passengerRepository: PassengerRepository;
}): PrincipalResolver {
  return async (apiKeyHash) => {
    const crewLead = await deps.crewLeadRepository.findByApiKeyHash(apiKeyHash);
    if (crewLead) {
      return { role: Role.CREW_LEAD, id: crewLead.id };
    }

    const passenger = await deps.passengerRepository.findByApiKeyHash(apiKeyHash);
    if (passenger) {
      return { role: Role.PASSENGER, id: passenger.id, membershipLevel: passenger.membershipLevel };
    }

    return null;
  };
}
