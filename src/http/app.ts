import express, { type Express } from 'express';
import { requestLogger } from './middleware/request-logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { healthRouter } from './routes/health.routes';

export function createApp(): Express {
  const app = express();

  app.use(requestLogger);
  app.use(express.json());

  app.use('/health', healthRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
