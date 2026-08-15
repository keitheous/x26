import { generateApiKey, hashApiKey } from '../domain/api-key';
import type { MembershipLevel } from '../domain/membership';
import type { Passenger, PassengerRepository } from '../repositories/interfaces';

export interface CreatePassengerInput {
  name: string;
  membershipLevel: MembershipLevel;
  createdByCrewLeadId: number;
}

export interface CreatePassengerResult {
  passenger: Passenger;
  apiKey: string;
}

export function createPassengerService(passengerRepository: PassengerRepository) {
  return {
    async createPassenger(input: CreatePassengerInput): Promise<CreatePassengerResult> {
      const apiKey = generateApiKey();
      const passenger = await passengerRepository.create({
        name: input.name,
        membershipLevel: input.membershipLevel,
        apiKeyHash: hashApiKey(apiKey),
        createdByCrewLeadId: input.createdByCrewLeadId,
      });
      return { passenger, apiKey };
    },

    async listPassengers(): Promise<Passenger[]> {
      return passengerRepository.list();
    },
  };
}

export type PassengerService = ReturnType<typeof createPassengerService>;
