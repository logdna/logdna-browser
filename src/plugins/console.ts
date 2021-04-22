import { Plugin, ILogDNABrowserLogger } from '../index.d';

type LogType = 'log' | 'debug' | 'error' | 'warn' | 'info' | 'assert';

export type Options = {
  integrations?: LogType[];
  enable?: boolean;
};

export const DEFAULT_CONSOLE_METHODS: LogType[] = [
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
    options: Options = {
      integrations: DEFAULT_CONSOLE_METHODS,
    },
  ) {
    this.options = options;
  }

  init(logdna: ILogDNABrowserLogger) {
    const { integrations = DEFAULT_CONSOLE_METHODS } = this.options;

    if (!Array.isArray(integrations)) {
      throw new Error(
        'LogDNA Browser Logger console integration types must be an array',
      );
    }

    const { log, debug, error, warn, info, assert } = window.console;
    const _windowConsole = { log, debug, error, warn, info, assert };

    (integrations || [])
      .map((method: LogType): LogType => method.toLowerCase() as LogType)
      .forEach((method: LogType) => {
        if (!DEFAULT_CONSOLE_METHODS.includes(method)) {
          throw Error(
            'LogDNA Browser Logger console plugin was passed an invalid console methods',
          );
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
