// @ts-nocheck
import Logger from '../src/logger';
import {
  FLUSH_BYTE_LIMIT,
  LOG_LINE_FLUSH_TIMEOUT,
  MAX_FETCH_ERROR_RETRY,
} from '../src/constants';

const log = jest.fn();

const defaultOptions = {
  flushInterval: LOG_LINE_FLUSH_TIMEOUT,
  hostname: 'host',
  tags: 'LogDNA-Browser',
  log,
};

describe('logger', () => {
  describe('constructor', () => {
    it('should configure options', () => {
      const logger = new Logger('APIKEY', {
        flushInterval: 500,
        hostname: 'host',
        tags: 'LogDNA-Browser',
      });

      expect(logger.options).toMatchObject({
        flushInterval: 500,
        hostname: 'host',
        tags: 'LogDNA-Browser',
      });
    });

    it('should set flushInterval to the min value when Nan is specified', () => {
      const logger = new Logger('APIKEY', {
        flushInterval: 100,
        hostname: 'host',
        tags: 'LogDNA-Browser',
      });

      expect(logger.options).toMatchObject({
        flushInterval: LOG_LINE_FLUSH_TIMEOUT,
        hostname: 'host',
        tags: 'LogDNA-Browser',
      });
    });

    it('should set flushInterval to the min when a options is too low', () => {
      const logger = new Logger('APIKEY', {
        flushInterval: 1,
        hostname: 'host',
        tags: 'LogDNA-Browser',
      });

      expect(logger.options).toMatchObject({
        flushInterval: LOG_LINE_FLUSH_TIMEOUT,
        hostname: 'host',
        tags: 'LogDNA-Browser',
      });
    });
  });

  describe('loglines', () => {
    let logger;

    beforeEach(() => {
      logger = new Logger('APIKEY', defaultOptions);
      logger.flush = jest.fn();
    });

    it('should add single items to the buffer', () => {
      expect(logger.logLinesBuffer.length).toBe(0);
      logger.logLines({
        line: 'Test',
      });
      expect(logger.logLinesBuffer.length).toBe(1);
    });

    it('should add array of items to the buffer', () => {
      expect(logger.logLinesBuffer.length).toBe(0);
      logger.logLines([
        {
          line: 'Test',
        },
      ]);
      expect(logger.logLinesBuffer.length).toBe(1);
      logger.logLines([
        {
          line: 'Test',
        },
        {
          line: 'Test',
        },
      ]);
      expect(logger.logLinesBuffer.length).toBe(3);
    });

    it('should call flush if buffer is over limit', () => {
      jest.useFakeTimers();
      global.clearTimeout = jest.fn();
      logger.isUnderByteLimit = jest.fn(() => false);
      logger.timer = 123;
      logger.logLines({
        lines: 'Testing',
      });
      jest.runTimersToTime();
      expect(logger.flush).toHaveBeenCalledTimes(1);
      expect(global.clearTimeout).toHaveBeenCalledTimes(1);
    });

    it('should call flush if buffer is under limit', () => {
      jest.useFakeTimers();
      logger.timer = 123;
      logger.logLines({
        lines: 'Testing',
      });
      jest.runTimersToTime();
      expect(logger.flush).toHaveBeenCalledTimes(1);
      expect(global.clearTimeout).toHaveBeenCalledTimes(1);
    });
  });

  describe('when calling sendOfflineLogs', () => {
    let logger;
    const lines = [{ message: 'Test' }];

    it('should send logLines', () => {
      logger = new Logger('APIKEY', defaultOptions);
      logger.logLines = jest.fn();
      window.localStorage.setItem(
        'logdna::browser::offline-cache',
        JSON.stringify(lines),
      );
      logger.sendOfflineLogs();

      expect(logger.logLines).toHaveBeenCalledWith(lines);
    });
  });

  describe('when checking online status', () => {
    let logger;

    beforeEach(() => {
      logger = new Logger('APIKEY', defaultOptions);
    });

    it('should return true when online', () => {
      jest.spyOn(navigator, 'onLine', 'get').mockReturnValueOnce(true);
      expect(logger.checkOnlineStatus()).toBeTruthy();
    });

    it('should return false when offline', () => {
      jest.spyOn(navigator, 'onLine', 'get').mockReturnValueOnce(false);
      expect(logger.checkOnlineStatus()).toBeFalsy();
    });

    it('should send loglines when it comes back online', () => {
      logger.sendOfflineLogs = jest.fn();
      jest.spyOn(navigator, 'onLine', 'get').mockReturnValueOnce(false);
      expect(logger.checkOnlineStatus()).toBeFalsy();
      jest.spyOn(navigator, 'onLine', 'get').mockReturnValueOnce(true);
      expect(logger.checkOnlineStatus()).toBeTruthy();
      expect(logger.sendOfflineLogs).toHaveBeenCalledTimes(1);
    });
  });

  describe('overflow buffer', () => {
    let logger;

    beforeEach(() => {
      logger = new Logger('APIKEY', defaultOptions);
    });

    it('should throw error when log line is too large', async () => {
      const lines = [
        {
          message: new Uint8Array(FLUSH_BYTE_LIMIT),
        },
      ];
      await logger.flush(lines);
      expect(log).toHaveBeenCalledTimes(1);
    });

    it('should split the log lines array when they are too large', async () => {
      logger.send = jest.fn(() => Promise.resolve());
      const message = new Uint8Array(512 * Float64Array.BYTES_PER_ELEMENT); // 512 * 8 bytes  = 35755 bytes
      // Lines total size is 71537 which is greater than 63 * 1024 bytes causing two iterations
      const lines = [
        {
          message,
        },
        {
          message,
        },
      ];

      await logger.flush(lines);
      expect(logger.send).toHaveBeenCalledTimes(2);
    });

    it('should flush logLinesBuffer when no params are passed to flush', async () => {
      logger.send = jest.fn(() => Promise.resolve());

      await logger.flush();
      expect(logger.send).toHaveBeenCalledTimes(0);
    });
  });

  describe('send', () => {
    let logger;
    const lines = [
      {
        message: 'Send message',
      },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
      logger = new Logger('APIKEY', defaultOptions);
      console.error = jest.fn();
      logger.offlineStorage.addLines = jest.fn();
    });

    it('network error should send to window.console', async () => {
      global.fetch = jest.fn(() =>
        Promise.reject({
          json: () => Promise.resolve({}),
        }),
      );
      await logger.send(lines);
      expect(console.error).toHaveBeenCalled();
      expect(logger.loggerError).toBeTruthy();
      expect(logger.offlineStorage.addLines).toHaveBeenCalledTimes(1);
    });

    it('network error should send to backed up window console when console integration is enabled', async () => {
      const errorLog = jest.fn();
      window.__LogDNA__ = {
        console: {
          error: errorLog,
        },
      };
      global.fetch = jest.fn(() =>
        Promise.reject({
          json: () => Promise.resolve({}),
        }),
      );
      await logger.send(lines);
      expect(errorLog).toHaveBeenCalled();
      expect(logger.loggerError).toBeTruthy();
      expect(logger.offlineStorage.addLines).toHaveBeenCalledTimes(1);
      window.__LogDNA__ = undefined;
    });

    it('network error called twice should add lines to storage and call fetch once', async () => {
      global.fetch = jest.fn(() =>
        Promise.reject({
          json: () => Promise.resolve({}),
        }),
      );
      await logger.send(lines);
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(logger.loggerError).toBeTruthy();
      expect(logger.offlineStorage.addLines).toHaveBeenCalledTimes(1);
      await logger.send(lines);
      expect(logger.offlineStorage.addLines).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should call send with loglines', async () => {
      jest.useFakeTimers();
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 200,
          json: () => Promise.resolve({}),
        }),
      );
      logger.isUnderByteLimit = jest.fn(() => true);
      logger.timer = 123;
      const buffer = {
        lines: 'Testing',
      };
      logger.logLines(buffer);
      jest.runTimersToTime();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('success', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({}),
        }),
      );
      await logger.send(lines);
      expect(logger.retryCount).toEqual(0);
      expect(logger.backOffInterval).toEqual(0);
    });

    it('400 error should send logs back into pipeline', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({}),
        }),
      );
      await logger.send(lines);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(log).toHaveBeenCalledTimes(1);
    });

    it('500 error should send logs back into pipeline', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({}),
        }),
      );
      await logger.send(lines);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(logger.logLinesBuffer).toEqual(lines);
    });

    it('500 error when retryCount has been reached will send logs to offline storage', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({}),
        }),
      );
      logger.retryCount = MAX_FETCH_ERROR_RETRY + 1;
      await logger.send(lines);
      expect(log).toHaveBeenCalledTimes(1);
    });
  });
});
