import { GlobalErrorHandlerPlugin } from './plugins/global-handler';
declare module 'logdna-browser-2' { }

interface LogDNAMethods { }

// This is fallback to 3rd party plugin methods
// Until TS has better Module Augmentation without
// relative paths https://github.com/Microsoft/TypeScript/issues/18877
declare module './LogDNAMethods' {
  interface LogDNAMethods {
    log(message: any, context?: LineContext, level?: LogLevel): void;
    error(message: any, context?: LineContext, level?: LogLevel): void;
    warn(message: any, context?: LineContext, level?: LogLevel): void;
    info(message: any, context?: LineContext, level?: LogLevel): void;
    debug(message: any, context?: LineContext, level?: LogLevel): void;
  }
}

declare module './LogDNAMethods' {
  interface LogDNAMethods {
    mark(name: string): void;
    measure(name: string, start: string, end: string): void;
  }
}

export type LogDNALogLine = {
  line: string;
  timestamp?: number;
  level?: string;
  meta?: any;
  env?: string;
  app?: string;
};

interface ConsoleOptions {
  enable?: boolean;
  integrations?: LogLevel[];
}

export type LogDNABrowserOptions = {
  hostname?: string;
  url?: string;
  app?: string;
  env?: string;
  flushInterval?: number;
  enableStacktrace?: boolean;
  sampleRate?: number;
  tags?: Tags;
  plugins?: Plugin[];
  console?: ConsoleOptions | boolean;
  globalErrorHandlers?: GlobalErrorHandlerPlugin | boolean;
  debug?: boolean;
  disabled?: boolean;
  ingestionKey?: string;
  hooks?: HooksOption;
  internalErrorLogger?: Function;
};

export type LineContext = object;

export type ErrorContext = {
  colno?: number;
  lineno?: number;
  stacktrace?: string;
  source?: string;
};

export type LogMessage = {
  level: LogLevel;
  message: any;
  lineContext?: LineContext;
  errorContext?: ErrorContext | null | undefined;
  disableStacktrace?: boolean;
};

export type Context = {
  [key: string]: any;
};

export type SessionId = string;

export type Tags = string | string[];

export type LogLevel = 'log' | 'debug' | 'error' | 'warn' | 'info';

export type Plugin = {
  name: string;
  init?: Function;
  methods?: Function;
  hooks?: Hooks;
};

type Hooks = {
  beforeSend: BeforeSendHook;
};

type BeforeSendHook = (logMessage: LogMessage) => LogMessage;

type HooksOption = {
  beforeSend: BeforeSendHook[];
};
