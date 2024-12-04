import { Telegraf } from 'telegraf';
import { createServer } from 'http';
import { logger } from '@red-alert/logger';
import { env } from './config';
import { loginAsAdmin, crud, DBLogTransport } from '@red-alert/db';
import { registerNotifier } from './notifier';

logger.addTransport(new DBLogTransport());

const bot = new Telegraf(env.BOT_TOKEN);

async function main() {
  await loginAsAdmin();

  bot.command('start', async ctx => {
    try {
      const chatId = ctx.message.chat.id;
      const from = ctx.message.from;

      const regLog = `/start | chatId=${chatId}`;
      logger.debug(`-> ${regLog}`);

      const exists = await crud.subscribers.chatIdExists(chatId);
      if (exists) {
        const msg = 'אתה כבר רשום';
        logger.debug(`<- ${regLog} | ${msg}`);
        ctx.reply(msg);
        return;
      }
      logger.debug(`Registering chatId=${chatId}`);
      await crud.subscribers.register({
        chat_id: chatId,
        fullname: `${from?.first_name || ''} ${from?.last_name || ''}`,
        username: from?.username || '',
        cities: [],
      });
      logger.debug(`Registered chatId=${chatId}`);

      const msg =
        'ברוך הבא לבוט צבע אדום לקבלת התרעות ייחודיות לפי בחירה.\nמעל מנת להירשם להתראות על רשימת ערים, אנא לחץ על התפריט, ויפתח לך דף לרישום לערים';
      logger.debug(`-> ${regLog} | ${msg}`);
      ctx.reply(msg);
    } catch (e) {
      const msg = 'יש אולי בעיה בשרת, המפתח קיבל התראה על כך ויתקן.';
      ctx.reply(msg);
    }
  });

  bot.command('list', async ctx => {
    const chatId = ctx.message.chat.id;
    const regLog = `/list | chatId=${chatId}`;

    try {
      const cities = await crud.subscribers.getCitiesByChatId(chatId);
      if (!cities.length) {
        const msg =
          'טרם נרשמת לערים מסוימות לקבלת התראות. לחץ על התפריט, ויפתח לך עמוד לרישום לערים';
        logger.debug(`<- ${regLog} | ${msg}`);
        ctx.reply(msg);
        return;
      }
      const citiesNames = cities.map(city => city.name).join('\n');
      logger.debug(`<- ${regLog} | citiesNames.length:${citiesNames.length}`);
      ctx.reply(citiesNames);
      return;
    } catch (e) {
      const msg =
        'טרם נרשמת לערים מסוימות לקבלת התראות. זכור להירשם באמצעות /start, ואח"כ על מנת להירשם להתראות על רשימת ערים, אנא לחץ על התפריט, ויפתח לך עמוד לרישום לערים';
      ctx.reply(msg);
    }
  });

  bot.command('about', async ctx => {
    const chatId = ctx.message.chat.id;
    const regLog = `/about | chatId=${chatId}`;
    const msg = `בוט התראות צבע אדום\nנועד לאפשר קבלת התראות בהתאמה אישית לפי רשימת ערים שאת/ה בוחר/ת\n\nמפתח: ${env.AUTHOR}`;
    logger.debug(`<- ${regLog}`);
    ctx.reply(msg);
  });

  logger.debug(`Starting bot, registering to webhook: ${env.WEBHOOK_DOMAIN}`);
  createServer(await bot.createWebhook({ domain: env.WEBHOOK_DOMAIN })).listen(
    env.WEBHOOK_PORT,
    '0.0.0.0',
    () => {
      logger.debug(`Bot is running and listening on 0.0.0.0:${env.WEBHOOK_PORT}`);
    },
  );

  logger.debug('Registering to alerts');
  registerNotifier((sub, alert) => {
    logger.debug(`<> new alert: ${alert.original_message_url}`);
    const msg = `צבע אדום ${alert.date}\n\n${alert.expand.cities.map(c => c.name).join('\n')}\n\nלינק להתרעה המקורית: ${alert.original_message_url}`;
    bot.telegram.sendMessage(sub.chat_id, msg);
  });

  bot.catch(e => {
    logger.error(JSON.stringify({ msg: 'bot error', e }));
    throw e;
  });

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

main();
