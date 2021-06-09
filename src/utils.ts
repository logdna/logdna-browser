import safeStringify from 'fast-safe-stringify';
import { ContextT, LogDNABrowserOptionsT } from './logdna.d';
import { HOSTNAME_CHECK } from './constants';
import { version } from '../package.json';

const hasSessionStorage = !!window.sessionStorage;
const SESSION_SCORE_KEY = 'logdna::browser::sessionscore';
const OFFLINE_STORAGE_KEY = 'logdna::browser::offline-cache';

// This is to remove any offline storage data that was created
// when we were using offline caching which was filling
// up the browser localstorage
const clearOfflineStorage = () => {
  try {
    window.localStorage.removeItem(OFFLINE_STORAGE_KEY);
  } catch (error) {}
};

const validateHostname = (hostname: string) => HOSTNAME_CHECK.test(hostname);

const stringify = (obj: object) => safeStringify(obj);

const jsonByteSize = (obj: object) => {
  const stringified = stringify(obj);
  if (window.TextEncoder) {
    return new TextEncoder().encode(stringified).length;
  }

  return new Blob([stringified]).size;
};

const includeInSampleRate = (
  sampleRate: number = 100,
  sampleRateScore: number,
) => sampleRateScore <= sampleRate;

// This will generate a session score and store it in session storage in case the
// user refreshes a spa or is not an spa app.
const generateSampleRateScore = () => {
  let score;
  if (hasSessionStorage) {
    score = window.sessionStorage.getItem(SESSION_SCORE_KEY);
    if (score && isNaN(+score)) score = null;
  }

  if (!score) {
    score = Math.floor(Math.random() * 100) + 1;
    hasSessionStorage &&
      window.sessionStorage.setItem(SESSION_SCORE_KEY, `${score}`);
  }

  return +score;
};

const parseTags = (tags: string | string[] = []) => {
  const DEFAULT_TAG = 'LogDNA-Browser';

  if (
    (typeof tags !== 'string' && !Array.isArray(tags)) ||
    (Array.isArray(tags) && tags.some(tag => typeof tag !== 'string'))
  ) {
    console.error(
      `LogDNA Browser Logger \`tags\` must be a string or an array of strings`,
    );
    return DEFAULT_TAG;
  }

  if (typeof tags === 'string') {
    return [DEFAULT_TAG, tags].join(',');
  }

  return [DEFAULT_TAG, ...tags].filter(tag => tag !== '').join(',');
};

const addDebugInfo = (
  options: LogDNABrowserOptionsT,
  context: ContextT | null,
  plugins: string[],
) => {
  //@ts-ignore
  window.__LogDNA__ = window.__LogDNA__ || {
    version,
    setDebug: (value: boolean) => {
      options.debug = !!value;
    },
    showConfig: () => ({ ...options }),
    showContext: () => ({ ...context }),
    showPlugins: () => [...plugins],
  };
};

// This is not used currently. May remove
/* istanbul ignore next */
const getIpAddress = async (): Promise<string | undefined> => {
  const url = 'https://www.cloudflare.com/cdn-cgi/trace';
  try {
    const response = await fetch(url, {
      method: 'GET',
    });
    const text = await response.text();

    // This doesnt validate if its a correct ip address
    const regex = /ip=([\d\.a-fA-f:]+)/;
    var ip = regex.exec(text);
    return ip ? ip[1] : undefined;
  } catch (error) {
    console.warn('LogDNA Browser Logger is unable to retrieve the ip address');
    return;
  }
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
function backOffWithJitter(base: number, cap: number, lastSleep: number) {
  const sleep = Math.min(cap, _randomBetween(base, lastSleep * 3));
  return sleep;
}

function _randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const isBrowserStorageAvailable = (
  storage: 'localStorage' | 'sessionStorage',
) => {
  if (!window[storage]) {
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

export default {
  validateHostname,
  jsonByteSize,
  generateSampleRateScore,
  includeInSampleRate,
  addDebugInfo,
  parseTags,
  getIpAddress,
  stringify,
  backOffWithJitter,
  isBrowserStorageAvailable,
  clearOfflineStorage,
};
