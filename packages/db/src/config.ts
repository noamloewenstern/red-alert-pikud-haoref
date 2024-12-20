import { cleanEnv, url, str } from 'envalid';
import dotenv from 'dotenv';
dotenv.config();
import memoize from 'p-memoize';

import PocketBase from 'pocketbase';

export const env = cleanEnv(process.env, {
  PB_URL: url(),
  ADMIN_EMAIL: str(),
  ADMIN_PASSWORD: str(),
});

export const pb = new PocketBase(env.PB_URL);
export const loginAsAdmin = memoize(async () => {
  console.debug('Logging in as admin to Pocketbase: ', env.PB_URL);
  await pb.admins.authWithPassword(env.ADMIN_EMAIL, env.ADMIN_PASSWORD);
  console.debug('Logged in to Pocketbase');
});

export function isLoggedIn() {
  return pb.authStore.isAdmin || pb.authStore.isAuthRecord;
}
