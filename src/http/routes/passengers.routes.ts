import { Router } from 'express';
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

  return router;
}
