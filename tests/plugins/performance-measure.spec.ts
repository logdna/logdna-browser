// @ts-nocheck
import PerformanceMeasurementPlugin from '../../src/plugins/performance-measure';

describe('Console Plugin', () => {
  let plugin;

  console.warn = jest.fn();

  const mockBrowserLoggerClient = {
    debug: jest.fn(),
    registerMethod: jest.fn(),
  };

  let observe = jest.fn();

  beforeEach(() => {
    plugin = new PerformanceMeasurementPlugin();
    window.PerformanceObserver = () => ({
      observe,
    });
    jest.clearAllMocks();
  });

  describe('when loaded', () => {
    it('should call PerformanceObserver observe', () => {
      plugin.init(mockBrowserLoggerClient);
      expect(observe).toHaveBeenLastCalledWith({ entryTypes: ['measure'] });
    });

    it('should register method mark with logdna browser logger', () => {
      plugin.init(mockBrowserLoggerClient);
      expect(mockBrowserLoggerClient.registerMethod).toHaveBeenCalledWith(
        'mark',
        expect.any(Function),
      );
    });

    it('should register method measure with logdna browser logger', () => {
      plugin.init(mockBrowserLoggerClient);
      expect(mockBrowserLoggerClient.registerMethod).toHaveBeenCalledWith(
        'measure',
        expect.any(Function),
      );
    });
  });
  describe('when missing functionality', () => {
    it('show throw error when PerformanceObserver is not in window', () => {
      delete global.PerformanceObserver;
      plugin.init(mockBrowserLoggerClient);
      expect(console.warn).toHaveBeenCalled();
    });

    it('show throw error when performance is not in window', () => {
      delete window.performance;
      plugin.init(mockBrowserLoggerClient);
      expect(console.warn).toHaveBeenCalled();
    });
  });
});
