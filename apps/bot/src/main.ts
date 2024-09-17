import { Telegraf } from 'telegraf';
import { createServer } from 'http';

import { env } from './config';
import { loginAsAdmin, crud } from '@red-alert/db';
import { registerNotifier } from './notifier';

const bot = new Telegraf(env.BOT_TOKEN);

async function main() {
  bot.command('register', async ctx => {
    const exists = await crud.subscribers.chatIdExists(ctx.message.chat.id);
    if (exists) {
      ctx.reply('אתה כבר רשום');
      return;
    }
    await crud.subscribers.register({
      chat_id: ctx.message.chat.id,
      fullname: `${ctx.message.from?.first_name || ''} ${ctx.message.from?.last_name || ''}`,
      username: ctx.message.from?.username || '',
      cities: [],
    });
    ctx.reply(
      'נרשמת בהצלחה\nמעל מנת להירשם להתראות על רשימת ערים, אנא לחץ על התפריט, ויפתח לך דף לרישום לערים',
    );
  });

  bot.command('list', async ctx => {
    const cities = await crud.subscribers.getCitiesByChatId(ctx.message.chat.id);
    if (!cities.length) {
      const msg =
        'טרם נרשמת לערים מסוימות לקבלת התראות.\nמעל מנת להירשם להתראות על רשימת ערים, אנא לחץ על התפריט, ויפתח לך דף לרישום לערים';
      ctx.reply(msg);
      return;
    }
    const citiesNames = cities.map(city => city.name).join('\n');
    ctx.reply(citiesNames);
  });
  bot.command('about', async ctx => {
    const msg = `בוט התראות צבע אדום\nנועד לאפשר קבלת התראות בהתאמה אישית לפי רשימת ערים שאת/ה בוחר/ת\n\nמפתח: ${env.AUTHOR}`;
    ctx.reply(msg);
  });

  console.log(`Starting bot, registering to webhook: ${env.WEBHOOK_DOMAIN}`);
  createServer(await bot.createWebhook({ domain: env.WEBHOOK_DOMAIN })).listen(
    env.WEBHOOK_PORT,
    '0.0.0.0',
    () => {
      console.log(`Bot is running and listening on 0.0.0.0:${env.WEBHOOK_PORT}`);
    },
  );

  await loginAsAdmin();
  console.log('Registering to alerts');
  registerNotifier((sub, alert) => {
    const msg = `צבע אדום ${alert.date}\n\n${alert.expand.cities.map(c => c.name).join('\n')}\n\nלינק להתרעה המקורית: ${alert.original_message_url}`;
    bot.telegram.sendMessage(sub.chat_id, msg);
  });

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

main();
