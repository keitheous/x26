import { createApp } from './http/app';
import { env } from './config/env';
import { logger } from './config/logger';

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`Server listening on port ${env.PORT}`);
});
