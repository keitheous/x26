import { generateApiKey, hashApiKey } from './domain/api-key';
import { ConflictError } from './domain/errors';
import type { CrewLeadRepository } from './repositories/interfaces';

const CREW_LEAD_NAMES = ['Crew Lead 1', 'Crew Lead 2', 'Crew Lead 3'];

export async function seedCrewLeads(crewLeadRepository: CrewLeadRepository): Promise<void> {
  for (const name of CREW_LEAD_NAMES) {
    const apiKey = generateApiKey();
    try {
      await crewLeadRepository.createWithNextSlot({ name, apiKeyHash: hashApiKey(apiKey) });
      console.log(`Crew Lead created: ${name} — API key: ${apiKey}`);
    } catch (err) {
      if (err instanceof ConflictError) {
        return;
      }
      throw err;
    }
  }
}
