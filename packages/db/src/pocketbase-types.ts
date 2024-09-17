/**
 * This file was @generated using pocketbase-typegen
 */

import type PocketBase from 'pocketbase';
import type { RecordService } from 'pocketbase';

export enum Collections {
  Alerts = 'alerts',
  Cities = 'cities',
  Subscribers = 'subscribers',
  Users = 'users',
}

// Alias types for improved usability
export type IsoDateString = string;
export type RecordIdString = string;
export type HTMLString = string;

// System fields
export type BaseSystemFields<T = never> = {
  id: RecordIdString;
  created: IsoDateString;
  updated: IsoDateString;
  collectionId: string;
  collectionName: Collections;
  expand?: T;
};

export type AuthSystemFields<T = never> = {
  email: string;
  emailVisibility: boolean;
  username: string;
  verified: boolean;
} & BaseSystemFields<T>;

// Record types for each collection

export type AlertsRecord = {
  alerted_subscribers?: boolean;
  cities: RecordIdString[];
  date: string;
  original_message_url: string;
};

export enum CitiesZoneOptions {
  'גליל עליון' = 'גליל עליון',
  'דרום הנגב' = 'דרום הנגב',
  'שפלת יהודה' = 'שפלת יהודה',
  'מרכז הגליל' = 'מרכז הגליל',
  'מנשה' = 'מנשה',
  'קו העימות' = 'קו העימות',
  'לכיש' = 'לכיש',
  'שרון' = 'שרון',
  'ירושלים' = 'ירושלים',
  'גולן דרום' = 'גולן דרום',
  'שומרון' = 'שומרון',
  'ים המלח' = 'ים המלח',
  'עוטף עזה' = 'עוטף עזה',
  'יהודה' = 'יהודה',
  'גולן צפון' = 'גולן צפון',
  'ואדי ערה' = 'ואדי ערה',
  'העמקים' = 'העמקים',
  'מרכז הנגב' = 'מרכז הנגב',
  'מערב הנגב' = 'מערב הנגב',
  'דן' = 'דן',
  'המפרץ' = 'המפרץ',
  'ירקון' = 'ירקון',
  'מערב לכיש' = 'מערב לכיש',
  'הכרמל' = 'הכרמל',
  'השפלה' = 'השפלה',
  'בקעת בית שאן' = 'בקעת בית שאן',
  'גליל תחתון' = 'גליל תחתון',
  'אילת' = 'אילת',
  'ערבה' = 'ערבה',
  'בקעה' = 'בקעה',
}

export enum CitiesZoneEnOptions {
  'Upper Galilee' = 'Upper Galilee',
  'South Negev' = 'South Negev',
  'Shfelat Yehuda' = 'Shfelat Yehuda',
  'Center Galilee' = 'Center Galilee',
  'Menashe' = 'Menashe',
  'Confrontation Line' = 'Confrontation Line',
  'Lachish' = 'Lachish',
  'Sharon' = 'Sharon',
  'Jerusalem' = 'Jerusalem',
  'South Golan' = 'South Golan',
  'Shomron' = 'Shomron',
  'Dead Sea' = 'Dead Sea',
  'Gaza Envelope' = 'Gaza Envelope',
  'Yehuda' = 'Yehuda',
  'North Golan' = 'North Golan',
  'Wadi Ara' = 'Wadi Ara',
  'HaAmakim' = 'HaAmakim',
  'Center Negev' = 'Center Negev',
  'West Negev' = 'West Negev',
  'Dan' = 'Dan',
  'HaMifratz' = 'HaMifratz',
  'Yarkon' = 'Yarkon',
  'West Lachish' = 'West Lachish',
  'HaCarmel' = 'HaCarmel',
  'HaShfela' = 'HaShfela',
  "Beit She'an Valley" = "Beit She'an Valley",
  'Lower Galilee' = 'Lower Galilee',
  'Eilat' = 'Eilat',
  'Arava' = 'Arava',
  "Bika'a" = "Bika'a",
}
export type CitiesRecord = {
  name: string;
  name_en: string;
  subs?: RecordIdString[];
  zone?: CitiesZoneOptions;
  zone_en?: CitiesZoneEnOptions;
};

export type SubscribersRecord = {
  chat_id: number;
  cities?: RecordIdString[];
  fullname?: string;
  username: string;
};

export type UsersRecord = {
  avatar?: string;
  name?: string;
};

// Response types include system fields and match responses from the PocketBase API
export type AlertsResponse<Texpand = unknown> = Required<AlertsRecord> & BaseSystemFields<Texpand>;
export type CitiesResponse<Texpand = unknown> = Required<CitiesRecord> & BaseSystemFields<Texpand>;
export type SubscribersResponse<Texpand = unknown> = Required<SubscribersRecord> &
  BaseSystemFields<Texpand>;
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>;

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
  alerts: AlertsRecord;
  cities: CitiesRecord;
  subscribers: SubscribersRecord;
  users: UsersRecord;
};

export type CollectionResponses = {
  alerts: AlertsResponse;
  cities: CitiesResponse;
  subscribers: SubscribersResponse;
  users: UsersResponse;
};

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
  collection(idOrName: 'alerts'): RecordService<AlertsResponse>;
  collection(idOrName: 'cities'): RecordService<CitiesResponse>;
  collection(idOrName: 'subscribers'): RecordService<SubscribersResponse>;
  collection(idOrName: 'users'): RecordService<UsersResponse>;
};
