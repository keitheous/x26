import { Router } from 'express';
import { Role } from '../../domain/membership';
import type { ReportingService } from '../../services/reporting.service';
import { authenticate, type PrincipalResolver } from '../middleware/authenticate';
import { requireRole } from '../middleware/require-role';

export function createReportsRouter(deps: {
  reportingService: ReportingService;
  resolvePrincipal: PrincipalResolver;
}): Router {
  const router = Router();
  const requireAuth = authenticate(deps.resolvePrincipal);

  router.get('/usage-by-level', requireAuth, requireRole(Role.CREW_LEAD), async (_req, res) => {
    const usageByLevel = await deps.reportingService.getUsageByLevel();
    res.status(200).json(usageByLevel);
  });

  return router;
}
