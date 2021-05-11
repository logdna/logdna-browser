import { detect } from 'detect-browser';
import {
  ContextT,
  LogDNABrowserOptionsT,
  StaticContext,
  ILogDNABrowserLogger,
  Plugin,
} from './index.d';
import utils from './utils';
import {
  DEFAULT_INGESTION_URL,
  LOG_LINE_FLUSH_TIMEOUT,
  SAMPLE_RATE,
} from './constants';

import Logger from './logger';
import SessionManager from './session-manager';
import ConsolePlugin from './plugins/console';
import GlobalErrorHandlerPlugin from './plugins/global-handlers';
import allPlugins from './plugins';

class LogDNABrowserLogger implements ILogDNABrowserLogger {
  Plugins = allPlugins;

  private context: ContextT = {};
  private logger?: Logger;
  private sessionManager = new SessionManager();
  private sampleRateScore = utils.generateSampleRateScore();
  private staticContext: StaticContext = {};
  private plugins: string[] = []; // The is the name of currently install plugins

  // Defaults
  private options: LogDNABrowserOptionsT = {
    url: DEFAULT_INGESTION_URL,
    hostname: 'logdna-browser-logger',
    flushInterval: LOG_LINE_FLUSH_TIMEOUT,
    enableStacktrace: true,
    enableIpAddress: false,
    sampleRate: SAMPLE_RATE,
    tags: [],
    app: window.location.host,
    plugins: [],
    console: true,
    globalErrorHandlers: true,
    debug: false,
    disabled: false,
  };

  init(
    ingestionKey: string,
    options?: LogDNABrowserOptionsT,
  ): LogDNABrowserLogger {
    this.options = { ...this.options, ...options };

    if (ingestionKey == null) {
      throw new Error('Ingestion key can not be undefined when calling init');
    }

    if (
      this.options.hostname &&
      !utils.validateHostname(this.options.hostname)
    ) {
      throw new Error(
        `LogDNA Browser Logger: \`${this.options.hostname}\` is not a valid hostname, see documentation for the \`hostname\` configuration option for details.`,
      );
    }

    if (
      this.options.sampleRate == null ||
      this.options.sampleRate < 0 ||
      this.options.sampleRate > 100 ||
      isNaN(this.options.sampleRate)
    ) {
      throw new Error(
        `LogDNA Browser Logger: \`sampleRate\` option must be a number between 0 and 100`,
      );
    }

    this.staticContext = this.getStaticContext();

    this.logger = new Logger(ingestionKey, {
      hostname: this.options.hostname || 'logdna-browser-logger',
      url: this.options.url,
      flushInterval: this.options.flushInterval,
      tags: utils.parseTags(this.options.tags),
      log: this.error,
    });
    utils.addDebugInfo(this.options, this.context, this.plugins);
    this.registerDefaultPlugins();
    this.registerPlugins(this.options.plugins);

    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'hidden') {
        this.logger?.flush();
      }
    });

    // for safari
    window.addEventListener('beforeunload', async () => {
      this.logger?.flush();
    });

    return this;
  }

  addContext(context: ContextT): LogDNABrowserLogger {
    this.context = {
      ...this.context,
      ...context,
    };
    return this;
  }

  setSessionId(sessionId: string): LogDNABrowserLogger {
    this.sessionManager.set(sessionId);
    return this;
  }

  clearContext() {
    this.context = {};
  }

  error(message: any, lineContext?: object) {
    if (this.options.debug) {
      window.console.error(this.formatMessageForDebug(message, lineContext));
      return;
    }
    this.logLines('error', message, lineContext);
  }

  warn(message: any, lineContext?: object) {
    if (this.options.debug) {
      window.console.warn(this.formatMessageForDebug(message, lineContext));
      return;
    }
    this.logLines('warn', message, lineContext);
  }

  debug(message: any, lineContext?: object) {
    if (this.options.debug) {
      window.console.debug(this.formatMessageForDebug(message, lineContext));
      return;
    }
    this.logLines('debug', message, lineContext);
  }

  info(message: any, lineContext?: object) {
    if (this.options.debug) {
      window.console.info(this.formatMessageForDebug(message, lineContext));
      return;
    }
    this.logLines('info', message, lineContext);
  }

  log(message: any, lineContext?: object) {
    if (this.options.debug) {
      window.console.log(this.formatMessageForDebug(message, lineContext));
      return;
    }
    this.logLines('log', message, lineContext);
  }

  captureError(error: Error | ErrorEvent, lineContext?: object) {
    const errorObj =
      error instanceof ErrorEvent && error.error instanceof Error
        ? error.error
        : error;

    this.error(
      {
        //@ts-ignore
        message: errorObj?.name
          ? //@ts-ignore
            `${errorObj?.name}: ${errorObj.message}`
          : errorObj.message || errorObj,
        //@ts-ignore
        stacktrace: errorObj?.stack,
        errorMessage: errorObj.message,
      },
      lineContext,
    );
  }

  registerMethod(name: string, fn: Function) {
    // @ts-ignore
    if (this[name]) {
      throw Error(
        'A LogDNA Browser Logger plugin is attempting to register a method that already exists.',
      );
    }
    // @ts-ignore
    this[name] = fn;
  }

  private formatMessageForDebug(message: any, lineContext: any) {
    let line = {
      message,
      ...lineContext,
    };
    if (typeof message === 'object' && message.message) {
      line = {
        ...message,
        ...lineContext,
      };
    }
    return line;
  }

  private registerDefaultPlugins() {
    const { console, globalErrorHandlers } = this.options;
    if (
      console === true ||
      (typeof console === 'object' && console.enable !== false)
    ) {
      const options = typeof console === 'object' ? console : undefined;

      this.registerPlugin(new ConsolePlugin(options));
    }

    if (globalErrorHandlers) {
      const options =
        typeof globalErrorHandlers === 'object'
          ? globalErrorHandlers
          : undefined;
      this.registerPlugin(new GlobalErrorHandlerPlugin(options));
    }
  }

  private registerPlugin(plugin: Plugin) {
    if (!plugin.name) {
      throw new Error(
        'A LogDNA Browser Logger plugin must contain a name property',
      );
    }

    if (typeof plugin.init !== 'function') {
      throw new Error(
        'A LogDNA Browser Logger plugin must contain an init function',
      );
    }

    if (this.plugins.includes(plugin.name)) {
      throw Error(
        `The plugin ${plugin.name} is already registered with LogDNA Browser`,
      );
    }

    this.plugins.push(plugin.name);
    plugin.init(this);
  }

  private registerPlugins(plugins?: Plugin[]) {
    if (Array.isArray(plugins)) {
      plugins.forEach(plugin => this.registerPlugin(plugin));
    }
  }

  private logLines(level: string, message: any, lineContext?: any) {
    if (this.logger == null) {
      throw new Error(
        'LogDNA Browser Logger: Attempting send to log lines before calling `.init()`',
      );
    }

    if (
      this.options.disabled ||
      !utils.includeInSampleRate(this.options.sampleRate, this.sampleRateScore)
    ) {
      return;
    }

    if (typeof lineContext !== 'object') {
      lineContext = { lineContext };
    }

    if (message instanceof Error || message instanceof ErrorEvent) {
      this.captureError(message, lineContext);
      return;
    }

    this.logger.logLines({
      timestamp: Math.floor(Date.now() / 1000),
      app: this.options.app,
      line: typeof message === 'string' ? message : utils.stringify(message),
      level,
      meta: {
        sessionId: this.sessionManager.get(),
        ...this.staticContext,
        ...this.getDynamicContext(),
        stacktrace: this.options?.enableStacktrace
          ? this.getStackTrace()
          : undefined,
        context: { ...this.context } || null,
        ...lineContext,
      },
    });
  }

  private getStackTrace() {
    const stack = new Error().stack || '';
    const array = stack.split('\n').map(line => line.trim());
    return array
      .splice(array[0] === 'Error' ? 2 : 1)
      .reduce((acc: String[], line) => {
        return !line.includes('logdna-browser-logger') ? [...acc, line] : acc;
      }, [])
      .join('\n');
  }

  /**
   * Fetches information about the context that is unlikely to change during the session (ex. browser)
   */
  private getStaticContext(): StaticContext {
    const browser = detect();

    return {
      browser: {
        ...browser,
        version: `${browser?.name}-${browser?.version}`,
        // Removing this for now because init returns a promise, not sure I want that....
        // ipAddress: this.options.enableIpAddress
        //   ? await utils.getIpAddress()
        //   : undefined,
      },
    };
  }

  /**
   * Fetches information about the context that is likely to change during the session (ex. window location)
   */
  private getDynamicContext() {
    return {
      location: window.location,
    };
  }
}

export default new LogDNABrowserLogger();

export { LogDNABrowserLogger };
