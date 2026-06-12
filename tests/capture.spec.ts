import { captureMessage, captureError, internalErrorLogger } from '../src/capture';
import * as bufferManager from '../src/buffer-manager';
import * as init from '../src/init';
import { DEFAULT_CONFIG } from '../src/constants';
import utils from '../src/utils';

const process = jest.spyOn(bufferManager, 'process').mockImplementationOnce(async () => {});

describe('capture.ts', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('captureMessage', () => {
    it('should return without calling process is sending is disabled', () => {
      jest.spyOn(init, 'isSendingDisabled').mockImplementationOnce(() => true);
      captureMessage({
        message: 'Testing',
        level: 'log',
      });
      expect(process).toHaveBeenCalledTimes(0);
    });

    it('should call process when sending is enabled', async () => {
      jest.spyOn(init, 'isSendingDisabled').mockImplementationOnce(() => false);
      await captureMessage({
        message: 'Testing',
        level: 'log',
      });
      expect(process).toHaveBeenCalledTimes(1);
    });

    it('should generate a logdna logline', async () => {
      jest.spyOn(init, 'isSendingDisabled').mockImplementationOnce(() => false);

      await captureMessage({
        message: 'Testing',
        level: 'log',
      });
      expect(process).toHaveBeenCalledTimes(1);
      expect(process).toHaveBeenCalledWith({
        timestamp: expect.any(Number),
        app: expect.any(String),
        line: 'Testing',
        level: 'log',
        meta: expect.any(Object),
      });
    });

    it('should generate an error context when message is an error', async () => {
      jest.spyOn(init, 'isSendingDisabled').mockImplementation(() => false);

      const error = new Error('Error Message');
      await captureMessage({
        message: error,
        level: 'log',
      });
      expect(process).toHaveBeenCalledTimes(1);
      expect(process).toHaveBeenCalledWith({
        timestamp: expect.any(Number),
        app: expect.any(String),
        line: 'Error: Error Message',
        level: 'error',
        meta: expect.any(Object),
      });
    });

    it('should call any beforeSend hooks when defined', async () => {
      const hook = jest.fn((data) => data);
      DEFAULT_CONFIG.hooks = {
        beforeSend: [hook],
      };
      await captureMessage({
        message: 'Testing',
        level: 'log',
      });
      expect(hook).toHaveBeenCalledTimes(1);
      expect(process).toHaveBeenCalledTimes(1);
    });
  });

  describe('captureError', () => {
    it('should return without calling process is sending is disabled', async () => {
      jest.spyOn(init, 'isSendingDisabled').mockImplementationOnce(() => true);
      const error = new Error('Error Message');
      await captureError(error);
      expect(process).toHaveBeenCalledTimes(0);
    });

    it('should call process when sending is enabled', async () => {
      jest.spyOn(init, 'isSendingDisabled').mockImplementationOnce(() => false);
      const error = new Error('Error Message');
      await captureError(error);
      expect(process).toHaveBeenCalledTimes(1);
    });

    it('should generate an error context when message is an error', async () => {
      jest.spyOn(init, 'isSendingDisabled').mockImplementationOnce(() => false);

      const error = new TypeError('Error Message');
      await captureError(error);

      expect(process).toHaveBeenCalledTimes(1);
      expect(process).toHaveBeenCalledWith({
        timestamp: expect.any(Number),
        app: expect.any(String),
        line: 'TypeError: Error Message',
        level: 'error',
        meta: expect.any(Object),
      });
    });

    it('should generate an error context and not add the type when it not provided', async () => {
      jest.spyOn(init, 'isSendingDisabled').mockImplementationOnce(() => false);

      const error = { message: 'Error Message' };
      await captureError(error);

      expect(process).toHaveBeenCalledTimes(1);
      expect(process).toHaveBeenCalledWith({
        timestamp: expect.any(Number),
        app: expect.any(String),
        line: 'Error Message',
        level: 'error',
        meta: expect.any(Object),
      });
    });

    it('should keep filename/lineno/colno from the error event when the Error lacks them (Chromium)', async () => {
      jest.spyOn(init, 'isSendingDisabled').mockImplementationOnce(() => false);

      // Chromium Errors do not carry fileName/lineNumber/columnNumber.
      const error = new Error('Boom');
      await captureError(error, false, {
        message: 'Boom',
        filename: 'https://app.example.com/main.js',
        lineno: 42,
        colno: 13,
      });

      const { meta } = process.mock.calls[0][0] as any;
      expect(meta.errorContext.source).toEqual('https://app.example.com/main.js');
      expect(meta.errorContext.lineno).toEqual(42);
      expect(meta.errorContext.colno).toEqual(13);
      expect(meta.errorContext.type).toEqual('Error');
    });

    it('should capture a string promise rejection reason instead of undefined', async () => {
      jest.spyOn(init, 'isSendingDisabled').mockImplementationOnce(() => false);

      await captureError('Something failed', true);

      const { line, meta } = process.mock.calls[0][0] as any;
      expect(line).toEqual('Uncaught (in promise) Something failed');
      expect(meta.errorContext.reason).toEqual('Something failed');
      expect(meta.errorContext.type).toEqual('string');
      expect(meta.errorContext.isUnhandledRejection).toEqual(true);
    });

    it('should capture a non-Error object promise rejection reason', async () => {
      jest.spyOn(init, 'isSendingDisabled').mockImplementationOnce(() => false);

      await captureError({ code: 500, detail: 'Internal' }, true);

      const { line, meta } = process.mock.calls[0][0] as any;
      expect(line).toContain('Uncaught (in promise)');
      expect(line).toContain('500');
      expect(meta.errorContext.reason).toEqual(JSON.stringify({ code: 500, detail: 'Internal' }));
    });

    it('should capture error.cause when present', async () => {
      jest.spyOn(init, 'isSendingDisabled').mockImplementationOnce(() => false);

      const cause = new TypeError('Root cause');
      const error = new Error('Wrapper');
      // @ts-ignore - cause may not be in lib target
      error.cause = cause;
      await captureError(error);

      const { meta } = process.mock.calls[0][0] as any;
      expect(meta.errorContext.cause).toEqual(expect.objectContaining({ type: 'TypeError', message: 'Root cause' }));
    });

    it('should include the raw stack as a fallback', async () => {
      jest.spyOn(init, 'isSendingDisabled').mockImplementationOnce(() => false);

      const error = new Error('With stack');
      await captureError(error);

      const { meta } = process.mock.calls[0][0] as any;
      expect(typeof meta.errorContext.rawStack).toEqual('string');
      expect(meta.errorContext.rawStack).toContain('With stack');
    });
  });

  describe('internalErrorLogger', () => {
    console.error = jest.fn();
    console.info = jest.fn();
    utils.originalConsole.error = jest.fn();
    utils.originalConsole.info = jest.fn();

    it('should log out to console error when default logger', () => {
      internalErrorLogger('My Internal Message');
      expect(utils.originalConsole.error).toHaveBeenCalledWith('My Internal Message');
      expect(console.error).toHaveBeenCalledTimes(0);
      expect(process).toHaveBeenCalledTimes(0);
    });

    it('should log out to console error all arguments when default logger', () => {
      internalErrorLogger('My Internal Message', 'Another', 'And Another');
      expect(utils.originalConsole.error).toHaveBeenCalledWith('My Internal Message', 'Another', 'And Another');
      expect(console.error).toHaveBeenCalledTimes(0);
      expect(process).toHaveBeenCalledTimes(0);
    });

    it('should log out to console info when the internalErrorLoggerLevel is defined ', () => {
      DEFAULT_CONFIG.internalErrorLoggerLevel = 'info';
      internalErrorLogger('My Internal Message');
      expect(utils.originalConsole.info).toHaveBeenCalledWith('My Internal Message');
      expect(console.info).toHaveBeenCalledTimes(0);
      expect(process).toHaveBeenCalledTimes(0);
      delete DEFAULT_CONFIG.internalErrorLoggerLevel;
    });

    it('should call custom logger when defined', () => {
      DEFAULT_CONFIG.internalErrorLogger = jest.fn();

      internalErrorLogger('My Internal Message');
      expect(DEFAULT_CONFIG.internalErrorLogger).toHaveBeenCalledWith('My Internal Message');
      expect(console.error).toHaveBeenCalledTimes(0);
      delete DEFAULT_CONFIG.internalErrorLogger;
    });

    it('should not log out to console when internal logger is disabled ', () => {
      DEFAULT_CONFIG.disableInternalErrorLogger = true;
      internalErrorLogger('My Internal Message');
      expect(utils.originalConsole.error).toHaveBeenCalledTimes(0);
      expect(console.info).toHaveBeenCalledTimes(0);
      expect(process).toHaveBeenCalledTimes(0);
      DEFAULT_CONFIG.disableInternalErrorLogger = false;
    });
  });
});
