import { Plugin, ILogDNABrowserLogger, LogType } from '../index.d';
export type Options = {
  prefix?: String;
  logLevel?: LogType;
};

const NAMESPACE = 'logdna:';

/* istanbul ignore next */
class PerformanceMeasurePlugin implements Plugin {
  name = 'PerformanceMeasurePlugin';
  logdna: any;
  options: Options;

  constructor(options: Options = {}) {
    const defaultOptions: Options = {
      prefix: 'Performance Measurement',
      logLevel: 'debug',
    };

    this.options = { ...defaultOptions, ...options };
  }

  init(logdna: ILogDNABrowserLogger) {
    if (
      'performance' in window === false ||
      'PerformanceObserver' in window === false
    ) {
      console.warn(
        `LogDNA Browser Logger cannot initialize ${this.name}. This browser doesn't support \`performance\` or \`PerformanceObserver\`.`,
      );
      return;
    }

    const observer = new window.PerformanceObserver(items => {
      items.getEntries().forEach(item => {
        if (!item.name.startsWith(NAMESPACE)) {
          return;
        }
        const name = item.name.replace(NAMESPACE, '');
        const { prefix, logLevel = 'debug' } = this.options;
        const prefixMsg = prefix ? `${this.options.prefix}: ` : '';

        logdna[logLevel](
          `${prefixMsg}${name} took ${Math.floor(item.duration)}ms`,
          {
            performanceMeasurement: {
              duration: item.duration,
              name,
              entryTypes: item.entryType,
              startTime: item.startTime,
            },
          },
        );
      });
    });

    observer.observe({ entryTypes: ['measure'] });

    logdna.registerMethod('mark', (name: string) =>
      performance.mark(`${NAMESPACE}${name}`),
    );
    logdna.registerMethod(
      'measure',
      (name: string, start?: string, end?: string) => {
        if (end) {
          end = `${NAMESPACE}${end}`;
        }
        try {
          performance.measure(`${NAMESPACE}${name}`, `${NAMESPACE}${start}`);
        } catch (error) {
          console.debug(
            '`logdna.measure()` was called with an invalid or missing `mark`.',
            error,
          );
        }
      },
    );
  }
}

export default PerformanceMeasurePlugin;
