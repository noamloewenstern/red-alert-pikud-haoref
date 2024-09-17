import { loginAsAdmin, crud } from '@red-alert/db';
import { env } from './config';

async function main() {
  console.log(`Pruning ${env.DELETE_PER_ITERATION} old alerts...`);

  await loginAsAdmin();

  const { deleted, total } = await crud.alerts.pruneOldAlerts({
    alertedOnly: true,
    timespanMinutes: env.PRUNE_ALERT_TIMESPAN_MINUTES,
    page: 1,
    perPage: env.DELETE_PER_ITERATION,
  });

  console.log(`Deleted ${deleted} alerts out of ${total}`);
}

main();
