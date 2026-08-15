import { Router } from 'express';
import { ValidationError } from '../../domain/errors';
import { Role } from '../../domain/membership';
import type { PassengerService } from '../../services/passenger.service';
import { authenticate, type PrincipalResolver } from '../middleware/authenticate';
import { requireRole } from '../middleware/require-role';
import { validateBody } from '../middleware/validate';
import { createPassengerSchema, type CreatePassengerBody } from '../schemas/passengers.schema';

export function createPassengersRouter(deps: {
  passengerService: PassengerService;
  resolvePrincipal: PrincipalResolver;
}): Router {
  const router = Router();
  const requireAuth = authenticate(deps.resolvePrincipal);

  router.post(
    '/',
    requireAuth,
    requireRole(Role.CREW_LEAD),
    validateBody(createPassengerSchema),
    async (req, res) => {
      const body = req.body as CreatePassengerBody;
      const { passenger, apiKey } = await deps.passengerService.createPassenger({
        name: body.name,
        membershipLevel: body.membershipLevel,
        createdByCrewLeadId: req.principal!.id,
      });
      res.status(201).json({ ...passenger, apiKey });
    },
  );

  router.get('/', requireAuth, async (_req, res) => {
    const passengers = await deps.passengerService.listPassengers();
    res.status(200).json(passengers);
  });

  router.delete('/:id', requireAuth, requireRole(Role.CREW_LEAD), async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      throw new ValidationError('Invalid passenger id');
    }
    await deps.passengerService.deactivatePassenger(id);
    res.status(204).send();
  });

  return router;
}
