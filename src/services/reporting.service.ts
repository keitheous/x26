import type { UsageLog, UsageLogRepository } from '../repositories/interfaces';

const PERSONAL_HISTORY_LIMIT = 100;

export function createReportingService(usageLogRepository: UsageLogRepository) {
  return {
    async getPersonalHistory(passengerId: number): Promise<UsageLog[]> {
      return usageLogRepository.findByPassenger(passengerId, PERSONAL_HISTORY_LIMIT);
    },
  };
}

export type ReportingService = ReturnType<typeof createReportingService>;
