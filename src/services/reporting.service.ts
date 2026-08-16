import type {
  ResourceDemand,
  UsageByLevel,
  UsageLog,
  UsageLogRepository,
} from '../repositories/interfaces';

const PERSONAL_HISTORY_LIMIT = 100;
const RESOURCE_DEMAND_LIMIT = 10;

export function createReportingService(usageLogRepository: UsageLogRepository) {
  return {
    async getPersonalHistory(passengerId: number): Promise<UsageLog[]> {
      return usageLogRepository.findByPassenger(passengerId, PERSONAL_HISTORY_LIMIT);
    },

    async getUsageByLevel(): Promise<UsageByLevel[]> {
      return usageLogRepository.aggregateByLevel();
    },

    async getResourceDemand(): Promise<ResourceDemand[]> {
      return usageLogRepository.aggregateResourceDemand(RESOURCE_DEMAND_LIMIT);
    },
  };
}

export type ReportingService = ReturnType<typeof createReportingService>;
