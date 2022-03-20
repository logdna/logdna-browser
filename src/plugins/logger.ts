import { captureMessage } from '../capture';
import { LogLevel, LineContext } from '../logdna';
import utils from '../utils';
import { getOptions } from '../init';

declare module '../LogDNAMethods' {
  interface LogDNAMethods {
    log(message: any, context?: LineContext, level?: LogLevel): void;
    error(message: any, context?: LineContext, level?: LogLevel): void;
    warn(message: any, context?: LineContext, level?: LogLevel): void;
    debug(message: any, context?: LineContext, level?: LogLevel): void;
    info(message: any, context?: LineContext, level?: LogLevel): void;
  }
}

const log = (message: any, context?: LineContext, level: LogLevel = 'log') => {
  captureMessage({
    level,
    message,
    lineContext: context,
  });

  if (getOptions().debug) {
    utils.originalConsole[level](...[message, context].filter(i => i !== undefined));
  }
};

const error = (message: any, context?: LineContext) => {
  log(message, context, 'error');
};

const warn = (message: any, context?: LineContext) => {
  log(message, context, 'warn');
};

const debug = (message: any, context?: LineContext) => {
  log(message, context, 'debug');
};

const info = (message: any, context?: LineContext) => {
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
