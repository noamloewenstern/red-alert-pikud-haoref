import { cleanEnv, num } from 'envalid';
import dotenv from 'dotenv';
dotenv.config();

export const env = cleanEnv(process.env, {
  PRUNE_ALERT_TIMESPAN_MINUTES: num(),
  DELETE_PER_ITERATION: num({ default: 100 }),
});
