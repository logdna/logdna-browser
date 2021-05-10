import { Options as ConsoleOptions } from './plugins/console';
import { Options as GlobalErrorHandlerOptions } from './plugins/global-handlers';

export type ContextT = { [key: string]: string };
export type LogDNABrowserOptionsT = {
  hostname?: string;
  url?: string;
  app?: string;
  env?: string;
  flushInterval?: number;
  enableStacktrace?: boolean;
  enableIpAddress?: boolean;
  sampleRate?: number;
  tags?: string | string[];
  plugins?: Plugin[];
  console?: ConsoleOptions | boolean;
  globalErrorHandlers?: GlobalErrorHandlerOptions | boolean;
  debug?: boolean;
  disabled?: boolean;
};

export type LoggerOptionsT = {
  url?: string;
  app?: string;
  hostname: string;
  flushInterval?: number;
  tags: string;
  log: Function;
};
export type LogDNALogLine = {
  line: string;
  timestamp?: number;
  level?: string;
  meta?: any;
  env?: string;
  app?: string;
};
export type StaticContext = {
  browser?: object;
};

export type LogType = 'log' | 'debug' | 'error' | 'warn' | 'info';

export interface Plugin {
  readonly name: string;
  init(logdna: any): void;
}

export interface ILogDNABrowserLogger {
  init(
    ingestionKey: string,
    options?: LogDNABrowserOptionsT,
  ): ILogDNABrowserLogger;
  addContext(context: ContextT): ILogDNABrowserLogger;
  setSessionId(sessionId: string): void;
  clearContext(): void;
  error(message: any, lineContext?: object): void;
  log(message: any, lineContext?: object): void;
  warn(message: any, lineContext?: object): void;
  debug(message: any, lineContext?: object): void;
  info(message: any, lineContext?: object): void;
  captureError(error: ErrorEvent | Error, lineContext?: object): void;
  registerMethod(name: string, fn: Function): void;
}
