import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { ValidationError } from '../../domain/errors';

export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new ValidationError(result.error.issues.map((issue) => issue.message).join(', ')));
      return;
    }
    req.body = result.data;
    next();
  };
}
