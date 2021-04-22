import { LoggerOptionsT, LogDNALogLine } from './index.d';
import {
  LOG_LINE_FLUSH_TIMEOUT,
  FLUSH_BYTE_LIMIT,
  MAX_FETCH_ERROR_RETRY,
  STARTING_BACK_OFF,
  MAX_BACK_OFF,
} from './constants';
import utils from './utils';
import OfflineStorage from './offline-storage';

export default class Logger {
  private ingestionKey: string;
  private options: LoggerOptionsT & {
    flushInterval: number;
  };
  private logLinesBuffer: Array<any> = []; // TODO Add type
  private timer?: number;

  private loggerError = false;
  private retryCount = 0;
  private backOffInterval = 0;
  private offlineStorage = new OfflineStorage();
  private isOnline = navigator.onLine;

  constructor(ingestionKey: string, options: LoggerOptionsT) {
    this.ingestionKey = ingestionKey;
    this.options = {
      ...options,
      flushInterval:
        options.flushInterval == null ||
        isNaN(options.flushInterval) ||
        options.flushInterval < LOG_LINE_FLUSH_TIMEOUT
          ? LOG_LINE_FLUSH_TIMEOUT
          : options.flushInterval,
    };

    this.sendOfflineLogs();
  }

  private overflowBuffer(logLines: LogDNALogLine[]) {
    const lines = [...logLines];
    const half = Math.floor(lines.length / 2);
    const lines2 = lines.splice(half);

    [lines, lines2].forEach(async block => await this.flush(block));
  }

  async flush(lines?: LogDNALogLine[]) {
    if (!lines) {
      lines = [...this.logLinesBuffer];
      this.logLinesBuffer = [];
    }

    if (!lines.length) return;

    if (this.isUnderByteLimit(lines)) {
      await this.send(lines);
    } else if (lines.length === 1) {
      throw Error(
        `LogDNA Browser Logger was unable to send the previous log lines because the log size was greater than ${FLUSH_BYTE_LIMIT} bytes`,
      );
    } else {
      this.overflowBuffer(lines);
    }
  }

  async logLines(lines: LogDNALogLine | LogDNALogLine[]) {
    if (Array.isArray(lines)) {
      this.logLinesBuffer = this.logLinesBuffer.concat(lines);
    } else {
      this.logLinesBuffer.push(lines);
    }

    if (this.timer) {
      clearTimeout(this.timer);
    }

    if (!this.isUnderByteLimit(this.logLinesBuffer)) {
      return await this.flush();
    }

    this.timer = window.setTimeout(async () => {
      await this.flush();
      this.timer = undefined;
    }, this.timeout());
  }

  private timeout() {
    if (this.retryCount > 0) {
      this.backOffInterval = utils.backOffWithJitter(
        STARTING_BACK_OFF,
        MAX_BACK_OFF,
        this.backOffInterval || STARTING_BACK_OFF,
      );

      return this.backOffInterval;
    }

    return this.options.flushInterval;
  }

  private isUnderByteLimit(buffer: any[]) {
    return utils.jsonByteSize(buffer) < FLUSH_BYTE_LIMIT;
  }

  private sendOfflineLogs() {
    const offlineItems = this.offlineStorage.getLines();
    if (Array.isArray(offlineItems) && offlineItems.length > 0) {
      this.logLines(offlineItems);
    }
    this.offlineStorage.clear();
  }

  private checkOnlineStatus() {
    if (!navigator.onLine) {
      this.isOnline = false;
      return false;
    } else if (navigator.onLine && !this.isOnline) {
      this.sendOfflineLogs();
      return true;
    }
    return true;
  }

  private async send(lines: LogDNALogLine[]): Promise<any> {
    if (this.loggerError || !this.checkOnlineStatus()) {
      this.offlineStorage.addLines(lines);
      return;
    }

    const ingestUrlParams = new URLSearchParams([
      ['hostname', this.options.hostname],
      ['now', `${Date.now()}`],
      ['tags', this.options.tags],
    ]);

    const ingestUrl = `${this.options.url}?${ingestUrlParams}`;
    const errorMsg = 'Unable to send previous logs batch to LogDNA.';

    try {
      const response = await fetch(ingestUrl, {
        method: 'POST',
        keepalive: true,
        headers: {
          Authorization: `Basic ${btoa(`${this.ingestionKey}:`)}`,
          'Content-Type': 'application/json',
        },
        body: utils.stringify({ lines }),
      });

      if (response.ok) {
        this.retryCount = 0;
        this.backOffInterval = 0;
      } else {
        if (response.status >= 400 && response.status < 500) {
          throw Error(`${errorMsg}: ${response.statusText}`);
        } else if (response.status >= 500) {
          this.retryCount = this.retryCount + 1;
          if (this.retryCount > MAX_FETCH_ERROR_RETRY) {
            throw Error(`${errorMsg}: ${response.statusText}`);
          } else {
            this.logLines(lines);
          }
        }
      }
    } catch (error) {
      // If we have any issues sending logs shut down the service immediately
      // This is to avoid ending up in a circular loop of error logs and causing app
      // performance issues or ddos-ing out api.
      this.loggerError = true;
      this.offlineStorage.addLines(lines);
      window.console.error(
        `LogDNA Browser Logger is unable to send logs to LogDNA. 
        Possible issues:
         - Your web apps url (${window?.location?.origin}) is not listed in your LogDNA account's CORS whitelist domains
         - Ingestion key is incorrect
         - The configured LogDNA ingestion url is incorrect
         - LogDNA ingestion endpoint is down. https://status.logdna.com/

         Error: ${error.message}
        `,
      );
      throw new Error(
        'Shutting down LogDNA Browser Logger due to an issue. We will attempt to store log lines locally and resent when the connection is restored',
      );
    }
  }
}
