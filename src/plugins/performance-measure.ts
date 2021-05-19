import {
  Plugin,
  ILogDNABrowserLogger,
  PerformanceMeasureOptions,
} from '../types';

const NAMESPACE: string = 'logdna:';

/* istanbul ignore next */
class PerformanceMeasurePlugin implements Plugin {
  name = 'PerformanceMeasurePlugin';
  logdna: any;
  options: PerformanceMeasureOptions;

  constructor(options: PerformanceMeasureOptions = {}) {
    const defaultOptions: PerformanceMeasureOptions = {
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
