import { captureMessage } from '../capture';
const NAMESPACE = 'logdna:';

import { LogLevel } from '../logdna';

type MetricPlugin = {
  prefix: string;
  logLevel: LogLevel;
};

const DEFAULT_OPTIONS: MetricPlugin = {
  prefix: 'Performance Measurement',
  logLevel: 'debug',
};

const mark = (name: string) => {
  performance.mark(`${NAMESPACE}${name}`);
};

const measure = (name: string, start: string, end: string) => {
  if (end) {
    end = `${NAMESPACE}${end}`;
  }

  try {
    performance.measure(`${NAMESPACE}${name}`, `${NAMESPACE}${start}`);
  } catch (error) {
    console.debug('`logdna.measure()` was called with an invalid or missing `mark`.', error);
  }
};

const Metrics = (opts: MetricPlugin = DEFAULT_OPTIONS) => ({
  name: 'MetricsPlugin',
  init() {
    const options = { ...DEFAULT_OPTIONS, ...opts };

    if ('performance' in window === false || 'PerformanceObserver' in window === false) {
      console.warn(`LogDNA Browser Logger cannot initialize ${this.name}. This browser doesn't support \`performance\` or \`PerformanceObserver\`.`);
      return;
    }

    const observer = new window.PerformanceObserver(items => {
      items.getEntries().forEach(item => {
        if (!item.name.startsWith(NAMESPACE)) {
          return;
        }
        const name = item.name.replace(NAMESPACE, '');
        const { prefix, logLevel = 'debug' } = options;
        const prefixMsg = prefix ? `${options.prefix}: ` : '';

        captureMessage({
          level: logLevel,
          message: `${prefixMsg}${name} took ${Math.floor(item.duration)}ms`,
          lineContext: {
            performanceMeasurement: {
              duration: item.duration,
              name,
              entryTypes: item.entryType,
              startTime: item.startTime,
            },
          },
        });
      });
    });

    observer.observe({ entryTypes: ['measure'] });
  },
  methods() {
    return { mark, measure };
  },
});

export default Metrics;
