import { z } from 'zod';
import type { Request, Response } from 'express';
import { validateBody } from '../../../src/http/middleware/validate';
import { ValidationError } from '../../../src/domain/errors';

describe('validateBody', () => {
  const schema = z.object({ name: z.string().min(1) });

  it('replaces request body with the parsed result', () => {
    const req = { body: { name: 'John' } } as unknown as Request;
    const next = jest.fn();

    validateBody(schema)(req, {} as Response, next);

    expect(req.body).toEqual({ name: 'John' });
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next with a ValidationError when the schema has a mismatch', () => {
    const req = { body: { name: '' } } as unknown as Request;
    const next = jest.fn();

    validateBody(schema)(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
  });
});
