// @ts-nocheck
import { LogDNABrowserLogger } from '../src/index';

let logdna;
const API_KEY = '123123123123123';

describe('LogDNA Browser Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    logdna = new LogDNABrowserLogger();
    // Reset registered plugins on each test
    logdna.plugins = [];
  });

  describe('validation', () => {
    it('should throw error when no api key is defined', () => {
      expect(() => logdna.init()).toThrow();
    });

    it('should not throw error when an api key is defined', () => {
      expect(() => logdna.init(API_KEY)).not.toThrow();
    });

    it('should not throw error when the options object is empty', () => {
      expect(() => logdna.init('123123', {})).not.toThrow();
    });

    it('should throw an error when a unsupported host name is used', () => {
      expect(() =>
        logdna.init(API_KEY, {
          hostname: '*&(*&(',
        }),
      ).toThrow();
    });

    it('should not an throw error when a supported host name is used', () => {
      expect(() =>
        logdna.init(API_KEY, {
          hostname: 'logdna-browser-logger',
        }),
      ).not.toThrow();
    });

    it(`should throw an error when a sampleRate is greater than 100`, () => {
      expect(() =>
        logdna.init(API_KEY, {
          sampleRate: 1000,
        }),
      ).toThrow();
    });

    it(`should throw an error when a sampleRate is less than 0`, () => {
      expect(() =>
        logdna.init(API_KEY, {
          sampleRate: -1,
        }),
      ).toThrow();
    });

    it(`should throw an error when a sampleRate isNaN`, () => {
      expect(() =>
        logdna.init(API_KEY, {
          sampleRate: 'asdfasdfasdf',
        }),
      ).toThrow();
    });

    it(`should not throw an error when sampleRate is between 0 - 100`, () => {
      expect(() =>
        logdna.init(API_KEY, {
          sampleRate: 50,
        }),
      ).not.toThrow();
    });
  });

  describe('disabled option', () => {
    it('should not call loglines when is disabled', () => {
      const lbl = logdna.init('123', { disabled: true });
      lbl.logger.logLines = jest.fn();
      logdna.log('Test');
      expect(lbl.logger.logLines).toHaveBeenCalledTimes(0);
    });

    it('should call loglines when disabled is false', () => {
      const lbl = logdna.init('123', { disabled: false });
      lbl.logger.logLines = jest.fn();
      logdna.log('Test');
      expect(lbl.logger.logLines).toHaveBeenCalledTimes(1);
    });
  });

  describe('register plugin', () => {
    it('should throw and error if missing name property', () => {
      class TestPlugin {}
      expect(() => logdna.registerPlugin(new TestPlugin())).toThrow();
    });

    it('should throw and error if missing init function', () => {
      class TestPlugin {
        name = 'Test';
      }
      expect(() => logdna.registerPlugin(new TestPlugin())).toThrow();
    });

    it('should throw and error if init is not a function', () => {
      class TestPlugin {
        name = 'Test';
        init = 'String';
      }
      expect(() => logdna.registerPlugin(new TestPlugin())).toThrow();
    });

    it('should register the plugin', () => {
      class TestPlugin {
        name = 'TestPlugin';
        init() {}
      }
      logdna.registerPlugins([new TestPlugin()]);
      expect(logdna.plugins.includes('TestPlugin')).toBeTruthy();
    });

    it('should throw error when registering a plugin twice', () => {
      class TestPlugin {
        name = 'TestPlugin';
        init() {}
      }
      expect(() =>
        logdna.registerPlugins([new TestPlugin(), new TestPlugin()]),
      ).toThrow();
    });
  });

  describe('default plugins', () => {
    it('should call register plugin twice', () => {
      logdna.registerPlugin = jest.fn();

      const lbl = logdna.init(API_KEY);
      expect(lbl.registerPlugin).toHaveBeenCalledTimes(2);
    });

    it('should call register default plugins', () => {
      logdna.registerDefaultPlugins = jest.fn();

      const lbl = logdna.init(API_KEY);
      expect(lbl.registerDefaultPlugins).toHaveBeenCalledTimes(1);
    });
  });

  describe('register method', () => {
    it('should add a new method to the logger', () => {
      logdna.registerMethod('testing', () => {});
      expect(typeof logdna['testing']).toEqual('function');
    });

    it('should throw an error if the new registered method already exists', () => {
      expect(() => logdna.registerMethod('log', () => {})).toThrowError();
    });
  });

  describe('user context', () => {
    it('should allow for the user to add a meta data', () => {
      const lbl = logdna.init('123');
      lbl.addContext({
        version: '1.1.1',
      });

      expect(lbl.context.version).toEqual('1.1.1');
    });

    it('should allow for the user to remove a meta data', () => {
      const lbl = logdna.init('123');
      logdna.addContext({
        version: '1.1.1',
      });

      expect(logdna.context.version).toEqual('1.1.1');
      logdna.clearContext();
      expect(logdna.context).toEqual({});
    });
  });

  describe('when sending logs', () => {
    let lbl: any;

    beforeEach(() => {
      lbl = logdna.init('123', { debug: false });

      logdna.logLines = jest.fn();
    });

    ['log', 'error', 'warn', 'info', 'debug'].forEach(method => {
      it(`when calling logdna.${method} logLines should be call with log type`, () => {
        const logLine = 'Test';
        lbl[method](logLine);

        expect(logdna.logLines).toBeCalledWith(method, logLine, undefined);
      });
    });

    ['log', 'error', 'warn', 'info', 'debug'].forEach(method => {
      it(`when calling logdna.${method} logLines should be call with log type and data`, () => {
        const logLine = 'Test';
        const data = { test: 'data' };
        lbl[method](logLine, data);

        expect(logdna.logLines).toBeCalledWith(method, logLine, data);
      });
    });
  });

  describe('calling browser log methods', () => {
    let lbl: any;
    beforeEach(() => {
      lbl = logdna.init('123', {
        debug: true,
      });

      logdna.logLines = jest.fn();
      window.console = {
        log: jest.fn(),
        debug: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
      };
    });
    const methods = ['log', 'error', 'warn', 'info', 'debug'];

    methods.forEach(method => {
      it(`when in debug mode calling logdna.${method}, logLines method will not be call but the console method will get called`, () => {
        const logLine = 'Test';
        const data = { test: 'data' };

        lbl[method](logLine, data);

        expect(console[method]).toBeCalledTimes(1);
        expect(logdna.logLines).toBeCalledTimes(0);
      });
    });
  });

  describe('setSessionId', () => {
    it('should set a custom session id', () => {
      logdna.init('123');

      logdna.setSessionId('123123');
      expect(logdna.sessionManager.get()).toBe('123123');
    });
  });

  describe('captureError', () => {
    it('should call error', () => {
      const lbl = logdna.init('123');
      logdna.error = jest.fn();
      logdna.captureError(new TypeError('Lol', 'someFile.js', 99));
      expect(logdna.error).toBeCalledWith(
        {
          message: 'TypeError: Lol',
          errorMessage: 'Lol',
          stacktrace: expect.stringMatching(
            /^TypeError: Lol\n.*?at Object.*?index\.spec\.ts/gi,
          ),
        },
        undefined,
      );
    });

    it('should call error when capturing a thrown string', () => {
      const lbl = logdna.init('123');
      logdna.error = jest.fn();
      logdna.captureError({
        message: 'thrown string value',
      });
      expect(logdna.error).toBeCalledWith(
        {
          message: 'thrown string value',
          errorMessage: 'thrown string value',
        },
        undefined,
      );
    });

    it('should format ErrorEvent properly', () => {
      const lbl = logdna.init('123');
      logdna.error = jest.fn();

      const error = new Error('Ahh!!');
      logdna.captureError(new ErrorEvent('msg', { message: 'msg2', error }));

      expect(logdna.error).toBeCalledWith(
        {
          message: `Error: Ahh!!`,
          errorMessage: 'Ahh!!',
          stacktrace: expect.stringMatching(
            /^Error: Ahh!!\n.*?at Object.*?index\.spec\.ts/gi,
          ),
        },
        undefined,
      );
    });
    it('should handle the case where a string is passed to capture error', () => {
      const lbl = logdna.init('123');
      logdna.error = jest.fn();
      logdna.captureError('Test string');
      expect(logdna.error).toBeCalledWith(
        {
          message: 'Test string',
        },
        undefined,
      );
    });
  });

  describe('stack trace', () => {
    // todo add better tests when we have better stack traces
    it('should return a string', () => {
      expect(logdna.getStackTrace()).toBeTruthy();
      expect(typeof logdna.getStackTrace()).toEqual('string');
    });
  });

  describe('dynamic content', () => {
    it('should return the location in an object', () => {
      const keys = Object.keys(logdna.getDynamicContext());
      expect(keys).toContain('location');
    });
  });
});
