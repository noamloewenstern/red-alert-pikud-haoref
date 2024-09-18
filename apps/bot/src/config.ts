import { cleanEnv, str, num } from 'envalid';
import dotenv from 'dotenv';
dotenv.config();

export const env = cleanEnv(process.env, {
  BOT_TOKEN: str(),
  WEBHOOK_DOMAIN: str(),
  WEBHOOK_PORT: num({ default: 80 }),
  AUTHOR: str(),
});
