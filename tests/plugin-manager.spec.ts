import { addDefaultPlugins, addPluginMethods, initPlugins, getInstalledPlugins } from '../src/plugin-manager';

import { DEFAULT_CONFIG } from '../src/constants';
import { LogDNAMethods } from '../src/LogDNAMethods';
import { LogDNABrowserOptions, Plugin, LogMessage } from '../src/logdna';

declare module '../src/LogDNAMethods' {
  interface LogDNAMethods {
    testMethod: () => {};
  }
}

const init = jest.fn();
const testMethod = jest.fn();

const TestPlugin = (): Plugin => ({
  name: 'TestPlugin',
  methods() {
    return {
      testMethod,
    };
  },
  init,
  hooks: {
    beforeSend({ level = 'log', message = 'Test' }: LogMessage): LogMessage {
      return {
        level,
        message,
      };
    },
  },
});

describe('plugin-manager.ts', () => {
  describe('no options.plugins path', () => {
    it('should not install anything', () => {
      let options: LogDNABrowserOptions = DEFAULT_CONFIG;
      DEFAULT_CONFIG.plugins = undefined;
      options = DEFAULT_CONFIG;
      expect(addPluginMethods(options)).toEqual(undefined);
      expect(initPlugins(options)).toEqual(undefined);
      expect(addDefaultPlugins(options)).toEqual(undefined);
      expect(getInstalledPlugins()).toEqual([]);
    });
  });

  describe('options.plugins exists', () => {
    let options: LogDNABrowserOptions = DEFAULT_CONFIG;
    beforeAll(() => {
      DEFAULT_CONFIG.plugins = [TestPlugin()];
      options = DEFAULT_CONFIG;
    });

    describe('getInstalledPlugins', () => {
      it('should return an array', () => {
        expect(getInstalledPlugins()).toEqual(expect.any(Array));
      });
    });

    describe('addPluginMethods', () => {
      it('should add methods to LogDNAMethods and not call the function when not initialized', () => {
        expect(LogDNAMethods.prototype.testMethod).toBeFalsy();
        addPluginMethods(options);
        expect(LogDNAMethods.prototype.testMethod).toBeTruthy();
        expect(typeof LogDNAMethods.prototype.testMethod).toEqual('function');
        const result = LogDNAMethods.prototype.testMethod();
        expect(result).toBeUndefined();
        expect(testMethod).toHaveBeenCalledTimes(0);
      });
    });

    describe('initPlugins', () => {
      it('should call plugin init function and add hooks', () => {
        expect(options?.hooks?.beforeSend?.length).toEqual(0);
        initPlugins(options);
        expect(init).toHaveBeenCalledTimes(1);
        expect(getInstalledPlugins().length).toEqual(1);
        expect(getInstalledPlugins()[0]).toEqual('TestPlugin');
        expect(options?.hooks?.beforeSend?.length).toEqual(1);
      });
    });
  });
});
