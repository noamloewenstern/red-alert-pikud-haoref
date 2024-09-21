import Transport from 'winston-transport';

export class CustomTransport extends Transport {
  constructor(options?: Transport.TransportStreamOptions) {
    super(options);
  }

  log(info: any, callback: any) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    callback();
  }
}
