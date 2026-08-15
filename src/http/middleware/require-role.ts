import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from '../../domain/errors';
import type { Role } from '../../domain/membership';

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.principal || !allowedRoles.includes(req.principal.role)) {
      next(new ForbiddenError('User is missing required membership permissions'));
      return;
    }
    next();
  };
}
