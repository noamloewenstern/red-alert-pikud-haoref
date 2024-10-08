export * as schema from './schema';
export * as config from './config';
export * as cities from './cities';
export * as crud from './crud';
export { PocketbaseTransport as DBLogTransport } from './logger';

export { loginAsAdmin } from './config';
import eventsource from 'eventsource';

// @ts-ignore
global.EventSource = eventsource;
