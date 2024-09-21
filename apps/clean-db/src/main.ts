import { loginAsAdmin, crud, DBLogTransport } from '@red-alert/db';
import { env } from './config';
import { logger } from '@red-alert/logger';
logger.addTransport(new DBLogTransport());

async function main() {
  logger.info(`Pruning ${env.DELETE_PER_ITERATION} old alerts...`);

  await loginAsAdmin();

  const { deleted, total } = await crud.alerts.pruneOldAlerts({
    alertedOnly: true,
    timespanMinutes: env.PRUNE_ALERT_TIMESPAN_MINUTES,
    page: 1,
    perPage: env.DELETE_PER_ITERATION,
  });

  logger.info(`Deleted ${deleted} alerts out of ${total}`);
}

main();
