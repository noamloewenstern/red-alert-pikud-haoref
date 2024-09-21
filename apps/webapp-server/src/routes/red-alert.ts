import { Hono } from 'hono';

// Apply the rate limiting middleware to all requests.
import { zValidator } from '@hono/zod-validator';
import { crud, DBLogTransport } from '@red-alert/db';
import { z } from 'zod';

import fs from 'fs';
import { Subscriber } from '@red-alert/db/schema';
import { logger } from '@red-alert/logger';
const app = new Hono();

logger.addTransport(new DBLogTransport());

// get sub/chat info
export const router = app
  .get(
    '/subs/:chatId',
    zValidator(
      'query',
      z.object({
        expandCities: z
          .string()
          .refine(value => value === 'true' || value === 'false', {
            message: 'Value must be a boolean',
          })
          .transform(value => value === 'true')
          .default('false'),
      }),
    ),
    async c => {
      const chatId = +c.req.param('chatId');
      const expandCities = c.req.valid('query').expandCities;
      try {
        const sub = await crud.subscribers.getSubByChatId(
          chatId,
          !!expandCities ? { expand: 'cities' } : {},
        );
        if (!sub) {
          return c.json({ error: 'INVALID_REQUEST' }, 400);
        }
        const dto = {
          chat_id: sub.chat_id,
          username: 'NoamLoewenstern',
          fullname: 'N L',
          expand: sub.expand as Subscriber<{ expanded: true }>['expand'],
        } as const;
        return c.json(dto);
      } catch (e) {
        logger.warn('Error getting sub', e);
        return c.json({ error: 'INVALID_REQUEST' }, 400);
      }
    },
  )
  .put(
    // set cities
    '/subs/:chatId',
    zValidator('json', z.object({ citiesNames: z.array(z.string()) })),
    async c => {
      try {
        const chatId = +c.req.param('chatId');
        const { citiesNames } = c.req.valid('json');
        const citiesIds = await crud.cities.getCitiesRecordsIds(citiesNames);
        await crud.subscribers.setCitiesByChatId(chatId, citiesIds);
        return c.json({ success: true }, 201);
      } catch (e) {
        return c.json({ error: 'INVALID_REQUEST' }, 400);
      }
    },
  )
  .post('/info-log', zValidator('json', z.object({ data: z.object({}) })), async c => {
    const { data } = c.req.valid('json');
    logger.info('data', data);
    function saveBodyToJSONFILE() {
      fs.writeFile('info-log.json', JSON.stringify(data), { encoding: 'utf8' }, err => {
        if (err) {
          logger.info('Error writing file', err);
        } else {
          logger.info('Successfully wrote file');
        }
      });
    }
    saveBodyToJSONFILE();
    return c.json({ data: 'ok-POST' });
  })
  .get('/', c => c.text('Should you be here?'));
