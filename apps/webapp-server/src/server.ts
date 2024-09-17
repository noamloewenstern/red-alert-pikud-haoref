import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { router } from './routes/red-alert';
import { serve } from '@hono/node-server';
import { logger } from 'hono/logger';
import { env } from './config/env';
import { rateLimiter } from 'hono-rate-limiter';
import { getConnInfo } from '@hono/node-server/conninfo';
import { loginAsAdmin } from '@red-alert/db';

const limiter = rateLimiter({
  windowMs: 15_000 * 60, // 15 minutes
  limit: 1_000,
  standardHeaders: 'draft-6',
  keyGenerator: c => getConnInfo(c).remote.address!, // id a client.
});
const app = new Hono()
  .use('*', logger())
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
      console.log(`Server is running on http://localhost:${info.port}`);
    },
  );
});
