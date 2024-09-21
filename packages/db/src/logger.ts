import Transport from 'winston-transport';
import * as crudLogger from './crud/logger';
import { loginAsAdmin, pb } from './config';

export class PocketbaseTransport extends Transport {
  private autoLogin: boolean;
  constructor(options?: Transport.TransportStreamOptions & { autoLogin?: boolean }) {
    super(options);
    this.autoLogin = !!(options?.autoLogin ?? true);
  }

  log(info: any, callback: any) {
    if (!pb.authStore.isAdmin && this.autoLogin) {
      loginAsAdmin().then(() => {
        this.log(info, callback);
      });
      return;
    }
    setImmediate(() => {
      this.emit('logged', info);
    });

    const { level, timestamp, message } = info;
    crudLogger.log(level, message, timestamp).then(() => callback?.());
  }
}
