import { LogDNABrowserOptions, Context, SessionId } from './logdna';

export class LogDNAMethods {}

export interface LogDNAMethods {
  init(ingestionKey: string, options?: LogDNABrowserOptions): void;
  config(ingestionKey: string, options?: LogDNABrowserOptions): void;
  plugins: any;
  addContext(context: Context): void;
  setSessionId(id: SessionId): void;
}
