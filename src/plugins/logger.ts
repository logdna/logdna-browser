import { captureMessage } from '../capture';
import { LogLevel } from '../logdna';

declare module '../LogDNAMethods' {
  interface LogDNAMethods {
    log(message: string, context?: Object, level?: LogLevel): void;
    error(message: string, context?: Object, level?: LogLevel): void;
    warn(message: string, context?: Object, level?: LogLevel): void;
    info(message: string, context?: Object, level?: LogLevel): void;
  }
}

const log = (message: string, context?: Object, level: LogLevel = 'log') => {
  captureMessage({
    level,
    message,
    lineContext: context,
  });
};

const error = (message: string, context?: Object) => {
  log(message, context, 'error');
};

const warn = (message: string, context?: Object) => {
  log(message, context, 'warn');
};

const debug = (message: string, context?: Object) => {
  log(message, context, 'debug');
};

const info = (message: string, context?: Object) => {
  log(message, context, 'info');
};

const Logger = () => ({
  name: 'LoggerPlugin',
  methods() {
    return {
      log,
      error,
      warn,
      info,
      debug,
    };
  },
});

export default Logger;
