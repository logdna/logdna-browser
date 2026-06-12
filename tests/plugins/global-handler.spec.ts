import GlobalErrorHandler from '../../src/plugins/global-handler';
import * as capture from '../../src/capture';

const captureError = jest.spyOn(capture, 'captureError');

const globalErrorHandler = GlobalErrorHandler();

describe('global-handler.ts', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should have a name property', () => {
    expect(globalErrorHandler.name).toEqual('GlobalErrorHandlerPlugin');
  });

  describe('init', () => {
    it('should call addEventListener', () => {
      window.addEventListener = jest.fn();
      // @ts-ignore
      globalErrorHandler.init({ enableUnhandledPromiseRejection: true });
      expect(window.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function), expect.any(Object));
    });

    window.addEventListener = jest.fn();
    // @ts-ignore
    globalErrorHandler.init({ enableErrorHandler: true });
    expect(window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
  });

  describe('handlers', () => {
    const getHandler = (eventName: string) => {
      const add = window.addEventListener as jest.Mock;
      const call = add.mock.calls.find((c) => c[0] === eventName);
      return call?.[1];
    };

    it('should forward the error event position fields to captureError', () => {
      captureError.mockImplementation(async () => {});
      window.addEventListener = jest.fn();
      // @ts-ignore
      globalErrorHandler.init({ enableErrorHandler: true });

      const error = new Error('Boom');
      const onError = getHandler('error');
      onError({
        error,
        message: 'Boom',
        filename: 'https://app.example.com/main.js',
        lineno: 42,
        colno: 13,
      } as ErrorEvent);

      expect(captureError).toHaveBeenCalledWith(error, false, {
        message: 'Boom',
        filename: 'https://app.example.com/main.js',
        lineno: 42,
        colno: 13,
      });
    });

    it('should forward the raw rejection reason to captureError', () => {
      captureError.mockImplementation(async () => {});
      window.addEventListener = jest.fn();
      // @ts-ignore
      globalErrorHandler.init({ enableUnhandledPromiseRejection: true });

      const onUnhandledRejection = getHandler('unhandledrejection');
      onUnhandledRejection({ reason: { code: 500 } } as PromiseRejectionEvent);

      expect(captureError).toHaveBeenCalledWith({ code: 500 }, true);
    });
  });
});
