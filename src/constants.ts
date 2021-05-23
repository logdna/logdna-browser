export const DEFAULT_INGESTION_URL: string =
  'https://logs.logdna.com/logs/ingest';
export const LOG_LINE_FLUSH_TIMEOUT: number = 250; // ms
export const FLUSH_BYTE_LIMIT: number = 60 * 1024; // Max chrome allows with fetch and keep alive is 64kb, we are making it smaller to account for headers and unknowns
export const SAMPLE_RATE: number = 100;

export const STARTING_BACK_OFF: number = 1000; // 1 sec
export const MAX_BACK_OFF: number = 60000; // 60 sec

export const MAX_FETCH_ERROR_RETRY: number = 30;

export const HOSTNAME_CHECK: RegExp = new RegExp(
  '^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\\.)*' +
    '([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$',
);
