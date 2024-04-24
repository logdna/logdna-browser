import safeStringify from 'fast-safe-stringify';
import StackTrace from 'stacktrace-js';
import { HOSTNAME_CHECK, DEFAULT_TAG, SESSION_SCORE_KEY } from './constants';
import { internalErrorLogger } from './capture';

import { Tags } from './logdna';

const validateHostname = (hostname: string) => HOSTNAME_CHECK.test(hostname);

const parseTags = (tags: Tags = []) => {
  if ((typeof tags !== 'string' && !Array.isArray(tags)) || (Array.isArray(tags) && tags.some((tag) => typeof tag !== 'string'))) {
    throw new Error(`LogDNA Browser Logger \`tags\` must be a string or an array of strings`);
  }

  if (typeof tags === 'string') {
    tags = [tags];
  }

  return [DEFAULT_TAG, ...tags].filter((tag) => tag !== '').join(',');
};

const stringify = (obj: unknown) => safeStringify(obj);

const processStackFrames = (stackframes: any) => {
  return stackframes
    .map(function (sf: any) {
      const sfString = sf.toString();
      if (sfString.includes('logdnasrc') || sfString.includes('@logdna/browser') || sfString.includes('stacktrace-js')) return null;
      return sfString;
    })
    .filter((l: string) => l !== null)
    .join('\n');
};

const getStackTraceFromError = async (error: Error) => {
  // This converts something like `throw 'some string'` into a real error
  if (typeof error === 'string') error = new Error(error);
  try {
    const stackframes = await StackTrace.fromError(error);
    return processStackFrames(stackframes);
  } catch (error) {}
};

const getStackTrace = async () => {
  try {
    const stackframes = await StackTrace.get();
    return processStackFrames(stackframes);
  } catch (error: any) {}
};

const _randomBetween = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
/**
 * This implements exponential backoff with "decorrelated jitter" for use in
 * failing HTTP calls and their retries.  Although the HTTP calls shouldn't be in
 * contention with other clients, the jitter will help alleviate a flood
 * of connections to the server in the event LogDNA suddenly comes back
 * online after being unavailable.
 *
 * @see https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
 *
 * @param   {Number} base The base sleep time to be used
 * @param   {Number} cap The maximum sleep time allowable in milliseconds
 * @param   {Number} lastSleep The last (or starting) sleep time used
 * @returns {Number} calculated sleep time
 */
const backOffWithJitter = (base: number, cap: number, lastSleep: number) => Math.min(cap, _randomBetween(base, lastSleep * 3));

const jsonByteSize = (obj: unknown) => {
  const stringified = stringify(obj);
  if (window.TextEncoder) {
    return new TextEncoder().encode(stringified).length;
  }

  return new Blob([stringified]).size;
};

const includeInSampleRate = (sampleRate: number = 100, sampleRateScore: number) => sampleRateScore <= sampleRate;

// This will generate a session score and store it in session storage in case the
// user refreshes a spa or is not an spa app.
const generateSampleRateScore = (): number => {
  let score;
  const hasSessionStorage = isBrowserStorageAvailable('sessionStorage');

  if (hasSessionStorage) {
    score = window.sessionStorage.getItem(SESSION_SCORE_KEY);
    if (score && isNaN(+score)) score = null;
  }

  if (!score) {
    score = Math.floor(Math.random() * 100) + 1;
    hasSessionStorage && window.sessionStorage.setItem(SESSION_SCORE_KEY, `${score}`);
  }

  return +score;
};

const isBrowserStorageAvailable = (storage: 'localStorage' | 'sessionStorage') => {
  if (!window && !window[storage]) {
    return false;
  }
  const testKey = 'test-key';
  try {
    window[storage].setItem(testKey, 'Test Data');
    window[storage].removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

const isFunction = (fn?: Function) => typeof fn === 'function';

const consoleMethods = ['log', 'error', 'debug', 'warn', 'info'];
let cachedConsole: any = consoleMethods.reduce((a: any, m: string) => ({ ...a, [m]: () => {} }), {});
const originalConsole: any = consoleMethods.reduce(
  (a: any, m: string) => ({
    ...a,
    [m]: (...args: any) => {
      cachedConsole[m](...args);
    },
  }),
  {},
);

// This will delay the caching of the original instance of the console
// until after logdna is enabled and initialized for use with SSR.
const cacheConsole = () => {
  const { log, error, debug, warn, info } = window.console;
  cachedConsole = { log, error, debug, warn, info };
};

export default {
  validateHostname,
  parseTags,
  stringify,
  getStackTrace,
  getStackTraceFromError,
  backOffWithJitter,
  jsonByteSize,
  includeInSampleRate,
  generateSampleRateScore,
  isBrowserStorageAvailable,
  isFunction,
  originalConsole,
  cacheConsole,
};
