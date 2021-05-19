import {
  InvalidConsoleIntegrationError,
  InvalidConsoleMethodError,
} from '../exceptions';
import {
  ConsoleOptions,
  ILogDNABrowserLogger,
  ConsoleLogType,
  Plugin,
} from '../types';

export const DEFAULT_CONSOLE_METHODS: ConsoleLogType[] = [
  'log',
  'debug',
  'error',
  'warn',
  'info',
  'assert',
];

class ConsolePlugin implements Plugin {
  name = 'ConsolePlugin';
  options;

  constructor(
    options: ConsoleOptions = {
      integrations: DEFAULT_CONSOLE_METHODS,
    },
  ) {
    this.options = options;
  }

  init(logdna: ILogDNABrowserLogger) {
    const { integrations = DEFAULT_CONSOLE_METHODS } = this.options;

    if (!Array.isArray(integrations)) {
      throw new InvalidConsoleIntegrationError();
    }

    const { log, debug, error, warn, info, assert } = window.console;
    const _windowConsole = { log, debug, error, warn, info, assert };

    //@ts-ignore
    window.__LogDNA__.console = _windowConsole;

    (integrations || [])
      .map(
        (method: ConsoleLogType): ConsoleLogType =>
          method.toLowerCase() as ConsoleLogType,
      )
      .forEach((method: ConsoleLogType) => {
        if (!DEFAULT_CONSOLE_METHODS.includes(method)) {
          throw new InvalidConsoleMethodError();
        }

        window.console[method] = (...args: any[]) => {
          //@ts-ignore
          logdna.logLines(method, args.length > 1 ? args : args[0]);
          _windowConsole[method](...args);
          return;
        };
      });
  }
}

export default ConsolePlugin;
