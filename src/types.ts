export type LogType = 'log' | 'debug' | 'error' | 'warn' | 'info';

export type ConsoleLogType = LogType | 'assert';

export type ContextT = { [key: string]: string };

export interface GlobalErrorHandlerOptions {
  enableErrorHandler?: boolean;
  enableUnhandledPromiseRejection?: boolean;
}

export interface ConsoleOptions {
  integrations?: ConsoleLogType[];
  enable?: boolean;
}

export interface PerformanceMeasureOptions {
  prefix?: String;
  logLevel?: LogType;
}

export interface LogDNABrowserOptionsT {
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
}

export interface LoggerOptionsT {
  url?: string;
  app?: string;
  hostname: string;
  flushInterval?: number;
  tags: string;
  log: Function;
}

export interface LogDNALogLine {
  line: string;
  timestamp?: number;
  level?: string;
  meta?: any;
  env?: string;
  app?: string;
}

export interface StaticContext {
  browser?: object;
}

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
