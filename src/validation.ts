import utils from './utils';

import { LogDNABrowserOptions } from './logdna';

const validateOptions = (opts: LogDNABrowserOptions) => {
  if (opts.ingestionKey == null) {
    throw new Error('Ingestion key can not be undefined when calling init');
  }

  if (!opts.hostname || (opts.hostname && !utils.validateHostname(opts.hostname))) {
    throw new Error(`LogDNA Browser Logger: \`${opts.hostname || 'undefined'}\` is not a valid hostname, see documentation for the \`hostname\` configuration option for details.`);
  }

  if (opts.sampleRate == null || opts.sampleRate < 0 || opts.sampleRate > 100 || isNaN(opts.sampleRate)) {
    throw new Error(`LogDNA Browser Logger: \`sampleRate\` option must be a number between 0 and 100`);
  }
};

export { validateOptions };
