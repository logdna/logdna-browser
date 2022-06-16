import { DEFAULT_CONFIG, LOG_LINE_FLUSH_TIMEOUT } from './constants';
import { validateOptions } from './validation';
import { addPluginMethods, initPlugins, addDefaultPlugins } from './plugin-manager';
import utils from './utils';
import { flush } from './buffer-manager';
import { init as sessionManagerInit } from './session-manager';
import { addDebugInfo } from './debug-info';

import { LogDNABrowserOptions } from './logdna';

import { LogDNAMethods } from './LogDNAMethods';

let options: LogDNABrowserOptions = DEFAULT_CONFIG;

let isConfigCompleted = false;
let isInitCompleted = false;
let sampleRate: number;
let methods: LogDNAMethods = new LogDNAMethods();

const config = (ingestionKey: string, opts: LogDNABrowserOptions = DEFAULT_CONFIG) => {
  options = Object.assign(DEFAULT_CONFIG, opts);
  options.ingestionKey = ingestionKey;
  options.tags = utils.parseTags(opts.tags);
  options.flushInterval =
    options.flushInterval == null || isNaN(options.flushInterval) || options.flushInterval < LOG_LINE_FLUSH_TIMEOUT ? LOG_LINE_FLUSH_TIMEOUT : options.flushInterval;

  validateOptions(options);
  addDefaultPlugins(options);
  addPluginMethods(options);

  isConfigCompleted = true;
};

const init = (ingestionKey: string, opts: LogDNABrowserOptions = DEFAULT_CONFIG) => {
  if (ingestionKey) {
    config(ingestionKey, opts);
  }

  if (opts.disabled) {
    return;
  }

  utils.cacheConsole();
  sampleRate = utils.generateSampleRateScore();
  initPlugins(options);
  addFlushEvents();
  sessionManagerInit();
  addDebugInfo();

  isInitCompleted = true;
};

const getOptions = (): LogDNABrowserOptions => options;
const isConfigured = (): Boolean => isConfigCompleted;
const isInitiated = (): Boolean => isInitCompleted;

const isSendingDisabled = (): Boolean => options.disabled || !utils.includeInSampleRate(options.sampleRate, sampleRate);

const addFlushEvents = () => {
  /* istanbul ignore next */
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'hidden') {
      flush();
    }
  });

  // for safari
  /* istanbul ignore next */
  window.addEventListener('beforeunload', async () => {
    flush();
  });
};

export { config, init, getOptions, isSendingDisabled, isConfigured, isInitiated, methods };
