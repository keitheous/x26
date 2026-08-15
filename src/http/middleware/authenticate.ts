import type { NextFunction, Request, Response } from 'express';
import { hashApiKey } from '../../domain/api-key';
import { Role, type MembershipLevel } from '../../domain/membership';
import { UnauthorizedError } from '../../domain/errors';

export interface Principal {
  role: Role;
  id: number;
  membershipLevel?: MembershipLevel;
}

export type PrincipalResolver = (apiKeyHash: string) => Promise<Principal | null>;

declare global {
  namespace Express {
    interface Request {
      principal?: Principal;
    }
  }
}

export function authenticate(resolvePrincipal: PrincipalResolver) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      next(new UnauthorizedError('Missing or malformed Authorization header'));
      return;
    }

    const apiKey = header.slice('Bearer '.length).trim();
    const principal = await resolvePrincipal(hashApiKey(apiKey));
    if (!principal) {
      next(new UnauthorizedError('Invalid API key'));
      return;
    }

    req.principal = principal;
    next();
  };
}
