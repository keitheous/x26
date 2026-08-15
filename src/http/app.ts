import express, { type Express } from 'express';
import helmet from 'helmet';
import type { PrincipalResolver } from './middleware/authenticate';
import type { PassengerService } from '../services/passenger.service';
import { requestLogger } from './middleware/request-logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { healthRouter } from './routes/health.routes';
import { createPassengersRouter } from './routes/passengers.routes';

export function createApp(deps: { passengerService: PassengerService; resolvePrincipal: PrincipalResolver }): Express {
  const app = express();

  app.use(helmet());
  app.use(requestLogger);
  app.use(express.json());

  app.use('/health', healthRouter);
  app.use('/passengers', createPassengersRouter(deps));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
