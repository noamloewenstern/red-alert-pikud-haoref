import winston from 'winston';
import Transport from 'winston-transport';

import { CustomTransport } from './custom-transport';

const levels = winston.config.npm.levels;
const envLevel = process.env.LOG_LEVEL?.toLowerCase() || 'info';
const level = Object.keys(levels).includes(envLevel) ? envLevel : 'info';

const customTransport = new CustomTransport({ level });

type Logger = winston.Logger & {
  addTransport: typeof addTransport;
};
export const logger = winston.createLogger({
  levels,
  transports: [new winston.transports.Console({ level }), customTransport],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    }),
  ),
}) as Logger;

export function onLog(
  cb: (info: { timestamp: string; level: keyof typeof levels; message: string }) => void,
) {
  customTransport.on('logged', cb);
}

(logger as Logger).addTransport = addTransport;

function addTransport(transport: Transport) {
  logger.transports.includes(transport) || logger.add(transport);
}
