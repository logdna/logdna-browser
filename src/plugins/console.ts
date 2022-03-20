import { captureMessage } from '../capture';
import utils from '../utils';

import { Plugin, LogLevel } from '../logdna';

export type ConsolePlugin =
  | {
      integrations?: LogLevel[];
    }
  | undefined;

const DEFAULT_CONSOLE_METHODS: LogLevel[] = ['log', 'debug', 'error', 'warn', 'info'];

const DEFAULT_OPTIONS = {
  integrations: DEFAULT_CONSOLE_METHODS,
};

const Console = (opts: ConsolePlugin = DEFAULT_OPTIONS): Plugin => ({
  name: 'ConsolePlugin',
  init() {
    const { integrations } = opts;

    if (!Array.isArray(integrations)) {
      throw new Error('LogDNA Browser Logger console integration types must be an array');
    }

    const { log, debug, error, warn, info } = window.console;
    const _windowConsole = { log, debug, error, warn, info };

    (integrations || [])
      .map(method => method.toLowerCase())
      .forEach(method => {
        if (!DEFAULT_CONSOLE_METHODS.includes(method as LogLevel)) {
          throw Error('LogDNA Browser Logger console plugin was passed an invalid console methods');
        }

        // @ts-ignore
        window.console[method] = (...args) => {
          captureMessage({
            level: method as LogLevel,
            message: args.length > 1 ? utils.stringify(args) : args[0],
          });

          // @ts-ignore
          _windowConsole[method](...args);
          return;
        };
      });
  },
});

export default Console;
