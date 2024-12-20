import { TelegramClient } from 'telegram';
import { NewMessage, NewMessageEvent } from 'telegram/events';
import { StringSession } from 'telegram/sessions';

import { loginAsAdmin, crud, DBLogTransport } from '@red-alert/db';
import { env } from './config';
import { logger } from '@red-alert/logger';

logger.addTransport(new DBLogTransport());

function parseRedAlertMessage(message: string) {
  const datePattern = /(?<date>\[[\d\/]+\] [\d\:+]+)/gm;
  const citiesTextPattern = /\n\n(?<cities>.*?אזור(?:.|\n)+)\n\n/g;
  const extractCityFromLinePattern = /^(?<city>.+?)( \(.+\))?$/;

  const citiesText = citiesTextPattern.exec(message)![0].trim();

  const cities = citiesText
    .split('\n\n')
    .map(subGroup => subGroup.split('\n').slice(1))
    .flat()
    .map(city => {
      const m = extractCityFromLinePattern.exec(city);
      return m?.groups?.city || city;
    });

  const date = datePattern.exec(message)?.groups?.date;
  if (!cities.length || !date) {
    logger.warn('No cities or date found');
    throw new Error('No cities or date found');
  }

  return {
    cities,
    date,
  };
}

async function onNewMessageHandler(event: NewMessageEvent) {
  try {
    const { cities: citiesNames, date } = parseRedAlertMessage(event.message.text);
    if (!event.message.chatId) {
      logger.warn('No chatId found in message', { text: event.message.text });
      return;
    }
    const channelId = event.message.chatId.toString().slice(4);
    const linkToMessage = `https://t.me/c/${channelId}/${event.message.id}`;

    const citiesValidyMap = Object.groupBy(citiesNames, city =>
      crud.cities.isValidCityName(city) ? 'valid' : 'invalid',
    );
    const validNames = citiesValidyMap['valid'] || [];
    const invalidNamesCities = citiesValidyMap['invalid'] || [];

    if (invalidNamesCities.length) {
      logger.warn('Invalid cities names:', invalidNamesCities);
    }

    if (!validNames.length) {
      logger.warn('No valid cities in message:', citiesNames);
      return;
    }
    const citiesRecordsIds = await crud.cities.getCitiesRecordsIds(validNames);
    await crud.alerts.newAlert({
      cities: citiesRecordsIds,
      date,
      original_message_url: linkToMessage,
    });
  } catch (e) {
    logger.warn('Error parsing message', e, event.message.text);
    return;
  }
}

const client = new TelegramClient(
  new StringSession(env.TELEGRAM_SESSION_STRING),
  env.TELEGRAM_API_ID,
  env.TELEGRAM_API_HASH,
  {
    connectionRetries: 5,
  },
);

async function main() {
  await loginAsAdmin();
  await client.connect();
  logger.info('Listening for new messages...');
  client.addEventHandler(
    onNewMessageHandler,
    new NewMessage({ chats: env.TELEGRAM_ALERTS_CHANNEL_ID.split(',') }),
  );
}

main();
