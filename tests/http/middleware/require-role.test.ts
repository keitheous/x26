import type { Request, Response } from 'express';
import { requireRole } from '../../../src/http/middleware/require-role';
import { Role } from '../../../src/domain/membership';
import { ForbiddenError } from '../../../src/domain/errors';

describe('requireRole', () => {
  it('calls next with no error when the role is allowed by the principal', () => {
    const req = { principal: { role: Role.CREW_LEAD, id: 1 } } as unknown as Request;
    const next = jest.fn();

    requireRole(Role.CREW_LEAD)(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('calls next with a ForbiddenError when the role is not allowed by the principal', () => {
    const req = { principal: { role: Role.PASSENGER, id: 1 } } as unknown as Request;
    const next = jest.fn();

    requireRole(Role.CREW_LEAD)(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it('calls next with a ForbiddenError when the principal is missing from the request', () => {
    const req = {} as unknown as Request;
    const next = jest.fn();

    requireRole(Role.CREW_LEAD)(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });
});
