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
    const regLog = `/start | chat.id=${ctx.message.chat.id}`;
    logger.debug(`-> ${regLog}`);
    const exists = await crud.subscribers.chatIdExists(ctx.message.chat.id);
    if (exists) {
      const msg = 'אתה כבר רשום';
      logger.debug(`<- ${regLog} | ${msg}`);
      ctx.reply(msg);
      return;
    }
    await crud.subscribers.register({
      chat_id: ctx.message.chat.id,
      fullname: `${ctx.message.from?.first_name || ''} ${ctx.message.from?.last_name || ''}`,
      username: ctx.message.from?.username || '',
      cities: [],
    });
    const msg =
      'ברוך הבא לבוט צבע אדום לקבלת התרעות ייחודיות לפי בחירה.\nמעל מנת להירשם להתראות על רשימת ערים, אנא לחץ על התפריט, ויפתח לך דף לרישום לערים';
    logger.debug(`-> ${regLog} | ${msg}`);
    ctx.reply(msg);
  });

  bot.command('list', async ctx => {
    const regLog = `/list | chat.id=${ctx.message.chat.id}`;

    try {
      const cities = await crud.subscribers.getCitiesByChatId(ctx.message.chat.id);
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
        'טרם נרשמת לערים מסוימות לקבלת התראות. זכור להירשם באמצעות /register, ואח"כ על מנת להירשם להתראות על רשימת ערים, אנא לחץ על התפריט, ויפתח לך עמוד לרישום לערים';
      ctx.reply(msg);
    }
  });

  bot.command('about', async ctx => {
    const regLog = `/about | chat.id=${ctx.message.chat.id}`;
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

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

main();
