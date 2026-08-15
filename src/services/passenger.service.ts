import { generateApiKey, hashApiKey } from '../domain/api-key';
import { NotFoundError } from '../domain/errors';
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

    async deactivatePassenger(id: number): Promise<void> {
      const passenger = await passengerRepository.findById(id);
      if (!passenger) {
        throw new NotFoundError('Passenger not found');
      }
      await passengerRepository.deactivate(id);
    },
  };
}

export type PassengerService = ReturnType<typeof createPassengerService>;
