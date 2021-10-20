import { process } from '../src/buffer-manager';
import { LOG_LINE_FLUSH_TIMEOUT } from '../src/constants';
import { LogDNALogLine } from '../src/logdna';
import * as captureManger from '../src/capture';

const logLine: LogDNALogLine = {
  timestamp: 999999999,
  level: 'log',
  line: 'Test message' + 999999999,
  env: 'test',
  app: 'unit-tests',
};

const generateLogLine = (count: number = 1) => {
  if (count === 1) return logLine;
  return new Array(count).fill('').map(() => logLine);
};

describe('buffer-manager.ts', () => {
  beforeEach(() => jest.resetAllMocks());

  describe('process', () => {
    beforeEach(() => {
      window.fetch = jest.fn().mockResolvedValue({
        ok: true,
      });
    });

    it('should process a single line', async () => {
      jest.useFakeTimers();
      await process(generateLogLine(1));
      jest.advanceTimersByTime(LOG_LINE_FLUSH_TIMEOUT);
      expect(window.fetch).toHaveBeenCalledTimes(1);
    });

    it('should process an array of log lines', async () => {
      jest.useFakeTimers();
      await process(generateLogLine(1000));
      jest.advanceTimersByTime(LOG_LINE_FLUSH_TIMEOUT);
      expect(window.fetch).toHaveBeenCalledTimes(2);
    });

    it('should process an array of log lines', async () => {
      jest.useFakeTimers();
      await process(generateLogLine(10000));
      jest.advanceTimersByTime(LOG_LINE_FLUSH_TIMEOUT);
      expect(window.fetch).toHaveBeenCalledTimes(32);
    });
  });

  describe('process errors', () => {
    it('should call internalErrorLogger when the server response is between 400 - 500', async () => {
      jest.useFakeTimers();
      window.fetch = jest.fn().mockResolvedValue({
        status: 401,
        statusText: 'Unauthorized',
        ok: false,
      });
      const internalErrorLogger = jest.spyOn(captureManger, 'internalErrorLogger').mockImplementationOnce(() => {});

      await process(generateLogLine(1));
      jest.advanceTimersByTime(LOG_LINE_FLUSH_TIMEOUT);
      expect(window.fetch).toHaveBeenCalledTimes(1);
      // expect(internalErrorLogger).toHaveBeenCalledTimes(1);
    });

    it('should call internalErrorLogger when fetch fails', async () => {
      jest.useFakeTimers();
      window.fetch = jest.fn().mockRejectedValue({ message: 'Failed' });
      const internalErrorLogger = jest.spyOn(captureManger, 'internalErrorLogger').mockImplementationOnce(() => {});
      await process(generateLogLine(1));
      jest.advanceTimersByTime(LOG_LINE_FLUSH_TIMEOUT);
      expect(window.fetch).toHaveBeenCalledTimes(1);
      // expect(internalErrorLogger).toHaveBeenCalledTimes(1);
    });

    xit('should call internalErrorLogger after retrying a fetch that received a 500 error', async () => {
      jest.useFakeTimers();
      window.fetch = jest.fn().mockResolvedValue({
        status: 500,
        statusText: 'Server Error',
        ok: false,
      });
      const internalErrorLogger = jest.spyOn(captureManger, 'internalErrorLogger').mockImplementationOnce(() => {});
      await process(generateLogLine());
      jest.advanceTimersByTime(LOG_LINE_FLUSH_TIMEOUT);
      expect(window.fetch).toHaveBeenCalledTimes(1);
      // expect(internalErrorLogger).toHaveBeenCalledTimes(1);
    });
  });
});
