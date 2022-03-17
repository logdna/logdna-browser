import { isInitiated } from './init';
import Logger from './plugins/logger';
import Console, { ConsolePlugin } from './plugins/console';
import GlobalErrorHandler, { GlobalErrorHandlerPlugin } from './plugins/global-handler';
import { internalErrorLogger } from './capture';
import utils from './utils';
import { LogDNABrowserOptions } from './logdna';
import { LogDNAMethods } from './LogDNAMethods';

type InstalledPlugins = string[];

const installedPlugins: InstalledPlugins = [];

export const addPluginMethods = (options: LogDNABrowserOptions) => {
  if (!Array.isArray(options.plugins)) return;

  options.plugins.forEach(p => {
    if (!utils.isFunction(p.methods)) return;

    // @ts-ignore
    const plugin = p.methods();
    Object.keys(plugin).forEach(m => {
      // @ts-ignore
      LogDNAMethods.prototype[m] = (...args: any) => {
        if (!isInitiated()) return;

        /* istanbul ignore next */
        plugin[m](...args);
      };
    });
  });
};

export const initPlugins = (options: LogDNABrowserOptions) => {
  if (!Array.isArray(options.plugins)) return;

  options.plugins.forEach(p => {
    if (utils.isFunction(p.init)) {
      try {
        // @ts-ignore
        p.init();
        installedPlugins.push(p.name);
      } catch (error) {
        /* istanbul ignore next */
        internalErrorLogger(`There was an issue initializing the ${p.name} plugin`);
        internalErrorLogger(error);
      }
    }

    if (p.hooks && options.hooks) {
      if (utils.isFunction(p.hooks.beforeSend)) {
        options.hooks.beforeSend.push(p.hooks.beforeSend);

        if (!installedPlugins.includes(p.name)) {
          installedPlugins.push(p.name);
        }
      }
    }
  });
};

export const addDefaultPlugins = (options: LogDNABrowserOptions) => {
  const { console: consoleOpts, globalErrorHandlers } = options;
  if (!options.plugins) {
    options.plugins = [];
  }

  /* istanbul ignore next */
  if (consoleOpts === true || (typeof consoleOpts === 'object' && consoleOpts.enable !== false)) {
    const consoleOptions: ConsolePlugin = typeof consoleOpts === 'object' ? { integrations: consoleOpts.integrations } : undefined;
    options.plugins.push(Console(consoleOptions));
  }

  if (globalErrorHandlers) {
    /* istanbul ignore next */
    const errorHandlerOptions: GlobalErrorHandlerPlugin = typeof globalErrorHandlers === 'object' ? globalErrorHandlers : undefined;
    options.plugins.push(GlobalErrorHandler(errorHandlerOptions));
  }

  // Always add logger methods
  options.plugins.push(Logger());
};

export const getInstalledPlugins = () => installedPlugins;
