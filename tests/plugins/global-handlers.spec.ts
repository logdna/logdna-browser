// @ts-nocheck
import GlobalErrorHandlerPlugin from '../../src/plugins/global-handlers';

describe('GlobalErrorHandlersPlugin', () => {
  describe('options', () => {
    it('should default options set', () => {
      const gehp = new GlobalErrorHandlerPlugin();
      expect(gehp.options).toMatchObject({
        enableErrorHandler: true,
        enableUnhandledPromiseRejection: true,
      });
    });
    it('should default have a name property set', () => {
      const gehp = new GlobalErrorHandlerPlugin();
      expect(gehp.name).toBe('GlobalErrorHandlerPlugin');
    });
  });

  describe('init', () => {
    it('should load the global error handler', () => {
      const gehp = new GlobalErrorHandlerPlugin();
      gehp.addGlobalError = jest.fn();
      gehp.addUnhandledrejection = jest.fn();
      gehp.init();
      expect(gehp.addGlobalError).toHaveBeenCalled();
      expect(gehp.addUnhandledrejection).toHaveBeenCalled();
    });
  });

  describe('addGlobalError', () => {
    it('should call logdna captureError', () => {
      const gehp = new GlobalErrorHandlerPlugin();
      const logdna = {
        error: jest.fn(),
        captureError: jest.fn(),
      };
      gehp.init(logdna);
      gehp.onError('Error Message');
      expect(logdna.captureError).toHaveBeenCalledWith('Error Message');
    });
  });

  describe('addUnhandledPromiseRejection', () => {
    it('should call logdna error', () => {
      const gehp = new GlobalErrorHandlerPlugin();
      const logdna = {
        error: jest.fn(),
        captureError: jest.fn(),
      };
      gehp.init(logdna);
      gehp.onUnhandledRejection('Error Message');
      expect(logdna.error).toHaveBeenCalledWith({
        error: 'Error Message',
        message: 'Uncaught (in promise) undefined',
      });
    });
    it('should call logdna error', () => {
      const gehp = new GlobalErrorHandlerPlugin();
      const logdna = {
        error: jest.fn(),
        captureError: jest.fn(),
      };
      gehp.init(logdna);
      gehp.onUnhandledRejection({
        reason: new Error('Test'),
      });
      expect(logdna.error).toHaveBeenCalled();
    });
  });
});
