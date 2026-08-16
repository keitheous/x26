import { Router } from 'express';
import { ForbiddenError, ValidationError } from '../../domain/errors';
import { Role } from '../../domain/membership';
import type { AccessService } from '../../services/access.service';
import type { MembershipService } from '../../services/membership.service';
import type { PassengerService } from '../../services/passenger.service';
import type { ReportingService } from '../../services/reporting.service';
import type { ResourceService } from '../../services/resource.service';
import { authenticate, type PrincipalResolver } from '../middleware/authenticate';
import { requireRole } from '../middleware/require-role';
import { validateBody } from '../middleware/validate';
import { createPassengerSchema, type CreatePassengerBody } from '../schemas/passengers.schema';
import { updateMembershipSchema, type UpdateMembershipBody } from '../schemas/membership.schema';
import { createUsageSchema, type CreateUsageBody } from '../schemas/usage.schema';

export function createPassengersRouter(deps: {
  passengerService: PassengerService;
  resourceService: ResourceService;
  membershipService: MembershipService;
  accessService: AccessService;
  reportingService: ReportingService;
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

  router.get('/:id/resources', requireAuth, requireRole(Role.PASSENGER), async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      throw new ValidationError('Invalid passenger id');
    }
    if (req.principal!.id !== id) {
      throw new ForbiddenError('Passengers may only view their own accessible resources');
    }
    const resources = await deps.resourceService.listAccessibleResources(
      req.principal!.membershipLevel!,
    );
    res.status(200).json(resources);
  });

  router.patch(
    '/:id/membership',
    requireAuth,
    requireRole(Role.CREW_LEAD),
    validateBody(updateMembershipSchema),
    async (req, res) => {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        throw new ValidationError('Invalid passenger id');
      }
      const body = req.body as UpdateMembershipBody;
      const passenger = await deps.membershipService.updateMembership(
        id,
        body.membershipLevel,
        req.principal!.id,
      );
      res.status(200).json(passenger);
    },
  );

  router.post(
    '/:id/usage',
    requireAuth,
    requireRole(Role.PASSENGER),
    validateBody(createUsageSchema),
    async (req, res) => {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        throw new ValidationError('Invalid passenger id');
      }
      if (req.principal!.id !== id) {
        throw new ForbiddenError('Passengers may only use resources on their own behalf');
      }
      const body = req.body as CreateUsageBody;
      await deps.accessService.validateUsage({
        passengerId: id,
        passengerLevel: req.principal!.membershipLevel!,
        resourceId: body.resourceId,
      });
      res.status(201).send();
    },
  );

  router.get('/:id/usage', requireAuth, requireRole(Role.PASSENGER), async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      throw new ValidationError('Invalid passenger id');
    }
    if (req.principal!.id !== id) {
      throw new ForbiddenError('Passengers may only view their own usage history');
    }
    const history = await deps.reportingService.getPersonalHistory(id);
    res.status(200).json(history);
  });

  return router;
}
