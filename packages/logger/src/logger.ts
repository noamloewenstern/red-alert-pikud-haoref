import winston from 'winston';
import Transport from 'winston-transport';

import { CustomTransport } from './custom-transport';

const levels = winston.config.npm.levels;
const envLevel = process.env.LOG_LEVEL?.toLowerCase() || 'info';
const level = Object.keys(levels).includes(envLevel) ? envLevel : 'info';

import jsonStringify from 'fast-safe-stringify';

const logLikeFormat = {
  transform(info: any) {
    const { timestamp, label, message } = info;
    const level = info[Symbol.for('level')];
    const args = info[Symbol.for('splat')];
    const strArgs = args.map(jsonStringify).join(' ');
    info[Symbol.for('message')] = `${timestamp} [${label}] ${level}: ${message} ${strArgs}`;
    return info;
  },
};

// const debugFormat = {
//   transform(info: any) {
//     console.log(info);
//     return info;
//   },
// };

const customTransport = new CustomTransport({ level });

type Logger = winston.Logger & {
  addTransport: typeof addTransport;
};
export const logger = winston.createLogger({
  levels,
  level,
  transports: [new winston.transports.Console(), customTransport],
  format: winston.format.combine(
    // debugFormat, // uncomment to see the internal log structure
    winston.format.timestamp(),
    winston.format.label({ label: process.env.SERVICE || 'red-alert-bot' }),
    winston.format.splat(),
    winston.format.simple(),
    logLikeFormat,
    // debugFormat, // uncomment to see the internal log structure
    // winston.format.printf(({ timestamp, level, message }) => {
    //   return `[${timestamp}] ${level}: ${message}`;
    // }),
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
