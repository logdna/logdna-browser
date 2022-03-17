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
});
