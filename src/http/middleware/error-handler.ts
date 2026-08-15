import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../domain/errors';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ code: 'NOT_FOUND', message: `No route for ${req.method} ${req.path}` });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.status).json({ code: err.code, message: err.message });
    return;
  }

  const error = err instanceof Error ? err : new Error('Unknown error');
  logger.error(error.message, { method: req.method, path: req.path, stack: error.stack });
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    ...(env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
  });
}
