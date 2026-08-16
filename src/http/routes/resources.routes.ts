import { Router } from 'express';
import { ValidationError } from '../../domain/errors';
import { Role } from '../../domain/membership';
import type { ResourceService } from '../../services/resource.service';
import { authenticate, type PrincipalResolver } from '../middleware/authenticate';
import { requireRole } from '../middleware/require-role';
import { validateBody } from '../middleware/validate';
import { createResourceSchema, type CreateResourceBody } from '../schemas/resources.schema';

export function createResourcesRouter(deps: {
  resourceService: ResourceService;
  resolvePrincipal: PrincipalResolver;
}): Router {
  const router = Router();
  const requireAuth = authenticate(deps.resolvePrincipal);

  router.post(
    '/',
    requireAuth,
    requireRole(Role.CREW_LEAD),
    validateBody(createResourceSchema),
    async (req, res) => {
      const body = req.body as CreateResourceBody;
      const resource = await deps.resourceService.createResource({
        name: body.name,
        category: body.category,
        minimumLevel: body.minimumLevel,
        capacity: body.capacity,
        provisionedByCrewLeadId: req.principal!.id,
      });
      res.status(201).json(resource);
    },
  );

  router.delete('/:id', requireAuth, requireRole(Role.CREW_LEAD), async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      throw new ValidationError('Invalid resource id');
    }
    await deps.resourceService.decommissionResource(id);
    res.status(204).send();
  });

  return router;
}
