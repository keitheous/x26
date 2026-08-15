import { createReportingService } from '../../src/services/reporting.service';
import { MembershipLevel } from '../../src/domain/membership';
import type { UsageLog, UsageLogRepository } from '../../src/repositories/interfaces';

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
    };
    const service = createReportingService(usageLogRepository);

    const result = await service.getPersonalHistory(1);

    expect(result).toBe(history);
    expect(usageLogRepository.findByPassenger).toHaveBeenCalledWith(1, 100);
  });
});
