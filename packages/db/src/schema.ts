import type { BaseModel } from 'pocketbase';
import z from 'zod';

export const CitySchema = z.object({
  name: z.string(),
  name_en: z.string(),
  zone: z.string(),
  zone_en: z.string(),
});

export const AlertSchema = z.object({
  date: z.string(),
  original_message_url: z.string(),
  cities: z.array(z.string()),
});
export const AlertSchemaExpanded = AlertSchema.extend({
  expand: z.object({
    cities: z.array(CitySchema),
  }),
});

export const SubscriberSchema = z.object({
  chat_id: z.number(),
  username: z.string(),
  fullname: z.string(),
  cities: z.array(z.string()),
});

export const SubscriberSchemaExpanded = SubscriberSchema.extend({
  expand: z.object({
    cities: z.array(CitySchema),
  }),
});

export type City = z.infer<typeof CitySchema>;
export type CityModel = BaseModel & City;

export type Alert<
  Opts extends {
    expanded: boolean;
  } = { expanded: false },
> = Opts['expanded'] extends false
  ? z.infer<typeof AlertSchema>
  : z.infer<typeof AlertSchemaExpanded>;

export type AlertModel<
  Opts extends {
    expanded: boolean;
  } = { expanded: false },
> = BaseModel & Alert<Opts>;

export type Subscriber<
  Opts extends {
    expanded: boolean;
  } = { expanded: false },
> = Opts['expanded'] extends false
  ? z.infer<typeof SubscriberSchema>
  : z.infer<typeof SubscriberSchemaExpanded>;

export type SubscriberModel<
  Opts extends {
    expanded: boolean;
  } = { expanded: false },
> = BaseModel & Subscriber<Opts>;

export const LogSchema = z.object({
  level: z.string(),
  text: z.string(),
  timestamp: z.string().optional(),
});
export type Log = z.infer<typeof LogSchema>;

export const db = {
  collections: {
    cities: 'cities',
    subscribers: 'subscribers',
    alerts: 'alerts',
    logs: 'logs',
  },
} as const;
