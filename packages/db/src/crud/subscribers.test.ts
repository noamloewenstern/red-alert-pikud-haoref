import { expect, beforeAll, test, describe } from 'vitest';

import { loginAsAdmin } from '../config';
import { getCitiesByChatId, getAllSubscribedToCities } from './subscribers';

const chatId = '714657326';
const citiesIds = ['oobcb6o0liuqig0', '39vmlqnfph7kd6x'];

describe('getCitiesByChatId', () => {
  beforeAll(async () => {
    await loginAsAdmin();
  });
  test('return expanded cities', async () => {
    const cities = await getCitiesByChatId(+chatId);
    expect(cities[0]).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        name_en: expect.any(String),
        zone: expect.any(String),
        zone_en: expect.any(String),
      }),
    );
  });
});

describe('getAllSubscribedToCities', () => {
  beforeAll(async () => {
    await loginAsAdmin();
  });
  test('chats subscribed to cities', async () => {
    const subs = await getAllSubscribedToCities(citiesIds);
    expect(subs.length).toBeGreaterThan(0);
  });
});
