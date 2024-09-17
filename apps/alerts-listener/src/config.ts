import { cleanEnv, str, num } from 'envalid';
import dotenv from 'dotenv';
dotenv.config();

export const env = cleanEnv(process.env, {
  API_ID: num(),
  API_HASH: str(),
  SESSION_STRING: str(),
  ALERTS_CHANNEL_ID: str(),
});
