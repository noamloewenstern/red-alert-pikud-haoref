import { cleanEnv, str, num, json } from 'envalid';
import dotenv from 'dotenv';
dotenv.config();

export const env = cleanEnv(process.env, {
  WEBAPP_STATIC_PATH: str({ default: '/static' }),
  PORT: num({ default: 8081 }),
  CORS_ORIGIN: json({ default: ['*'] }),
});
