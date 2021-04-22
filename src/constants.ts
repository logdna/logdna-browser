const DEFAULT_INGESTION_URL = 'https://logs.logdna.com/logs/ingest';
const LOG_LINE_FLUSH_TIMEOUT = 250; // ms
const FLUSH_BYTE_LIMIT = 60 * 1024; // Max chrome allows with fetch and keep alive is 64kb, we are making it smaller to account for headers and unknowns
const SAMPLE_RATE = 100;

const STARTING_BACK_OFF = 1000; // 1 sec
const MAX_BACK_OFF = 60000; // 60 sec

const MAX_FETCH_ERROR_RETRY = 30;

const HOSTNAME_CHECK = new RegExp('^([a-zA-Z0-9\\.\\:\\-\\_])*$');

export {
  DEFAULT_INGESTION_URL,
  LOG_LINE_FLUSH_TIMEOUT,
  FLUSH_BYTE_LIMIT,
  HOSTNAME_CHECK,
  SAMPLE_RATE,
  MAX_FETCH_ERROR_RETRY,
  STARTING_BACK_OFF,
  MAX_BACK_OFF,
};
