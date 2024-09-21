import Transport from 'winston-transport';
import * as crudLogger from './crud/logger';

export class PocketbaseTransport extends Transport {
  constructor(options?: Transport.TransportStreamOptions) {
    super(options);
  }

  log(info: any, callback: any) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const { level, timestamp, message } = info;
    crudLogger.log(level, message, timestamp).then(() => callback());
  }
}
