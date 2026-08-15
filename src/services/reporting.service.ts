import type { UsageByLevel, UsageLog, UsageLogRepository } from '../repositories/interfaces';

const PERSONAL_HISTORY_LIMIT = 100;

export function createReportingService(usageLogRepository: UsageLogRepository) {
  return {
    async getPersonalHistory(passengerId: number): Promise<UsageLog[]> {
      return usageLogRepository.findByPassenger(passengerId, PERSONAL_HISTORY_LIMIT);
    },

    async getUsageByLevel(): Promise<UsageByLevel[]> {
      return usageLogRepository.aggregateByLevel();
    },
  };
}

export type ReportingService = ReturnType<typeof createReportingService>;
