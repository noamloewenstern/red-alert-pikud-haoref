import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import readline from 'readline';

import { env } from './config';

const apiId = env.API_ID;
const apiHash = env.API_HASH;
const sessionString = env.SESSION_STRING;

const stringSession = new StringSession(sessionString);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});
async function authSessionString() {
  await client.connect();

  if (!(await client.checkAuthorization())) {
  }

  await client.start({
    phoneNumber: async () =>
      new Promise(resolve => rl.question('Please enter your number: ', resolve)),
    password: async () =>
      new Promise(resolve => rl.question('Please enter your password: ', resolve)),
    phoneCode: async () =>
      new Promise(resolve => rl.question('Please enter the code you received: ', resolve)),
    onError: err => console.log(err),
  });
  console.log('You should now be connected.');
  console.log(client.session.save()); // Save this string to avoid logging in again
}
async function main() {
  await authSessionString();
}

main();
