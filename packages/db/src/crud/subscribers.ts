import { City, db, Subscriber, SubscriberModel } from '../schema';
import { pb } from '../config';
import QuickLRU from 'quick-lru';
import { RecordOptions } from 'pocketbase';
import memoize from '@red-alert/common/utils/memoize';

export const getAllSubscribedToCities = memoize(
  async (citiesIds: string[]) => {
    return await pb.collection(db.collections.subscribers).getFullList<Subscriber>({
      filter: citiesIds.map(id => `cities ~ "${id}"`).join(' || '),
      requestKey: null,
    });
  },
  {
    cache: new QuickLRU({ maxSize: 10, maxAge: 10_000 }),
  },
);

export const chatIdExists = memoize(
  async (chatId: Subscriber['chat_id']) => {
    try {
      return (
        await pb
          .collection(db.collections.subscribers)
          .getFirstListItem(`chat_id = ${chatId}`, { fields: 'id,chat_id', requestKey: null })
      ).id;
    } catch (err) {
      return false;
    }
  },
  {
    cache: new QuickLRU({ maxSize: 100, maxAge: 60_000 * 60 }),
    cacheOnResult: id => !!id,
  },
);

export const getSub = memoize(
  async (subId: string, options?: RecordOptions) => {
    return await pb
      .collection(db.collections.subscribers)
      .getOne(subId, { ...options, requestKey: null });
  },
  {
    cache: new QuickLRU({ maxSize: 10, maxAge: 2_000 }),
  },
);
export const getSubByChatId = memoize(
  async (chatId: Subscriber['chat_id'], options?: RecordOptions) => {
    return await pb
      .collection(db.collections.subscribers)
      .getFirstListItem(`chat_id = ${chatId}`, { ...options, requestKey: null });
  },
  {
    cache: new QuickLRU({ maxSize: 10, maxAge: 2_000 }),
  },
);

export const setCitiesByChatId = async (chatId: Subscriber['chat_id'], citiesIds: string[]) => {
  const sub = await getSubByChatId(chatId);
  await pb
    .collection(db.collections.subscribers)
    .update(sub.id, { cities: citiesIds }, { requestKey: null });
};

export const register = async (sub: Subscriber) => {
  if (await chatIdExists(sub.chat_id)) {
    return;
  }
  return await pb.collection(db.collections.subscribers).create(sub, { requestKey: null });
};

export const updateCities = async (chatId: Subscriber['chat_id'], cities: City[]) => {
  if (await chatIdExists(chatId)) {
    return;
  }
  const sub = await getSubByChatId(chatId);
  await pb.collection(db.collections.subscribers).update(sub.id, { cities }, { requestKey: null });
};

export const getCitiesByChatId = memoize(
  async (chatId: Subscriber['chat_id']) => {
    const sub = await pb
      .collection(db.collections.subscribers)
      .getFirstListItem<
        SubscriberModel<{ expanded: true }>
      >(`chat_id = ${chatId}`, { expand: 'cities', requestKey: null });
    return sub.expand.cities;
  },
  {
    cache: new QuickLRU({ maxSize: 10, maxAge: 5_000 }),
  },
);
