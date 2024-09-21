import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { router } from './routes/red-alert';
import { serve } from '@hono/node-server';
import { logger as honoLogger } from 'hono/logger';
import { logger } from '@red-alert/logger';
import { env } from './config/env';
import { rateLimiter } from 'hono-rate-limiter';
import { getConnInfo } from '@hono/node-server/conninfo';
import { DBLogTransport, loginAsAdmin } from '@red-alert/db';

logger.addTransport(new DBLogTransport());

const limiter = rateLimiter({
  windowMs: 15_000 * 60, // 15 minutes
  limit: 1_000,
  standardHeaders: 'draft-6',
  keyGenerator: c => getConnInfo(c).remote.address!, // id a client.
});
const app = new Hono()
  .use('*', honoLogger())
  .use(limiter)
  .get('/health', c => c.json({ status: 'ok' }))
  .use(
    cors({
      origin: env.CORS_ORIGIN,
    }),
  )
  .route('/red-alert/api/v1', router)
  .get('/', c => c.text('Should you be here?'));

export type AppType = typeof router;

loginAsAdmin().then(() => {
  serve(
    {
      fetch: app.fetch,
      port: env.PORT,
    },
    info => {
      logger.info(`Server is running on http://localhost:${info.port}`);
    },
  );
});
