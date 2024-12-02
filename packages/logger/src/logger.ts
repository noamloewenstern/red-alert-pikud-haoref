import winston from 'winston';
import Transport from 'winston-transport';

import { CustomTransport } from './custom-transport';

const levels = winston.config.npm.levels;
const envLevel = process.env.LOG_LEVEL?.toLowerCase() || 'info';
const level = Object.keys(levels).includes(envLevel) ? envLevel : 'info';

import jsonStringify from 'fast-safe-stringify';

const logLikeFormat = {
  transform(info: any) {
    const { timestamp, label } = info;
    const args = info[Symbol.for('splat')];
    const formatedMessage = info[Symbol.for('message')];
    const strArgs = (args || []).map(jsonStringify).join(' ');
    const sufixMsg = args ? ` ${strArgs}` : '';
    info[Symbol.for('message')] = `${timestamp} [${label}] ${formatedMessage}${sufixMsg}`;
    return info;
  },
};

const customTransport = new CustomTransport({ level });

type Logger = winston.Logger & {
  addTransport: typeof addTransport;
};
export const logger = winston.createLogger({
  levels,
  level,
  transports: [new winston.transports.Console(), customTransport],
  format: winston.format.combine(
    winston.format.simple(),
    winston.format.label({ label: process.env.SERVICE || 'red-alert-bot' }),
    winston.format.timestamp(),
    logLikeFormat,
  ),
}) as Logger;

export function onLog(
  cb: (info: { timestamp: string; level: keyof typeof levels; message: string }) => void,
) {
  customTransport.on('logged', cb);
}

(logger as Logger).addTransport = addTransport;

function addTransport(transport: Transport) {
  if (!logger.transports.includes(transport)) {
    logger.add(transport);
  }
}
