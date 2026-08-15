import { createReportingService } from '../../src/services/reporting.service';
import { MembershipLevel } from '../../src/domain/membership';
import type { UsageByLevel, UsageLog, UsageLogRepository } from '../../src/repositories/interfaces';

describe('Reporting Service', () => {
  it('fetches personal history for the given passenger with a fixed cap', async () => {
    const history: UsageLog[] = [
      {
        id: 1,
        passengerId: 1,
        resourceId: 1,
        passengerLevelAtUse: MembershipLevel.GOLD,
        resourceMinLevelAtUse: MembershipLevel.SILVER,
        outcome: 'GRANTED',
        denialReason: null,
        occurredAt: new Date('2026-01-01T00:00:00Z'),
      },
    ];
    const usageLogRepository: UsageLogRepository = {
      create: jest.fn(),
      findByPassenger: jest.fn().mockResolvedValue(history),
      aggregateByLevel: jest.fn(),
    };
    const service = createReportingService(usageLogRepository);

    const result = await service.getPersonalHistory(1);

    expect(result).toBe(history);
    expect(usageLogRepository.findByPassenger).toHaveBeenCalledWith(1, 100);
  });

  it('passes the usage-by-level breakdown straight through from the repository', async () => {
    const breakdown: UsageByLevel[] = [
      { level: MembershipLevel.SILVER, granted: 3, denied: 1 },
      { level: MembershipLevel.GOLD, granted: 5, denied: 0 },
    ];
    const usageLogRepository: UsageLogRepository = {
      create: jest.fn(),
      findByPassenger: jest.fn(),
      aggregateByLevel: jest.fn().mockResolvedValue(breakdown),
    };
    const service = createReportingService(usageLogRepository);

    const result = await service.getUsageByLevel();

    expect(result).toBe(breakdown);
  });
});
