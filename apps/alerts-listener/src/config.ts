import { cleanEnv, str, num } from 'envalid';
import dotenv from 'dotenv';
dotenv.config();

export const env = cleanEnv(process.env, {
  TELEGRAM_API_ID: num(),
  TELEGRAM_API_HASH: str(),
  TELEGRAM_SESSION_STRING: str(),
  TELEGRAM_ALERTS_CHANNEL_ID: str(),
});
