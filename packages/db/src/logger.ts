import Transport from 'winston-transport';
import * as crudLogger from './crud/logger';
import { loginAsAdmin, pb } from './config';

export class PocketbaseTransport extends Transport {
  private autoLogin: boolean;
  constructor(options?: Transport.TransportStreamOptions & { autoLogin?: boolean }) {
    super(options);
    this.autoLogin = !!(options?.autoLogin || false);
  }

  log(info: any, callback: any) {
    if (this.autoLogin && !pb.authStore.isAdmin) {
      loginAsAdmin().then(() => {
        this.log(info, callback);
      });
      return;
    }

    const { level, timestamp, message } = info;
    crudLogger.log(level, message, timestamp).then(() => callback?.());
  }
}
