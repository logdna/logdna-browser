// All messages run through here
import { isSendingDisabled, getOptions } from './init';
import { process } from './buffer-manager';
import utils from './utils';
import { getStaticContext, getContext, getDynamicContext } from './context-manager';
import { getSessionId } from './session-manager';
import { LogMessage, ErrorEventContext } from './logdna';

const captureMessage = async ({ level = 'log', message, lineContext = {} }: LogMessage) => {
  if (isSendingDisabled()) return;

  if (message instanceof Error) {
    captureError(message);
    return;
  }

  await generateLogLine({ level, message, lineContext });
};

// Classify whatever was thrown/rejected (could be an Error, string, number,
// plain object, null, etc.) into a consistent shape so we never drop the value
const normalizeReason = (value: any) => {
  if (value instanceof Error) {
    return {
      type: value.name,
      message: value.message,
      isError: true,
      reason: undefined,
    };
  }

  if (typeof value === 'string') {
    return { type: 'string', message: value, isError: false, reason: value };
  }

  if (value === null || value === undefined || typeof value !== 'object') {
    return { type: typeof value, message: String(value), isError: false, reason: value };
  }

  // Plain object (or Error-like object) — keep both a human message and the raw value.
  const stringified = utils.stringify(value);
  return {
    type: value.name || value.constructor?.name || 'object',
    message: value.message ?? stringified,
    isError: false,
    reason: stringified,
  };
};

// Capture error.cause (ES2022) one level deep without risking deep/circular recursion.
const normalizeCause = (cause: any) => {
  if (cause === null || cause === undefined) return undefined;
  if (cause instanceof Error) {
    return {
      type: cause.name,
      message: cause.message,
      rawStack: typeof cause.stack === 'string' ? cause.stack : undefined,
    };
  }
  const normalized = normalizeReason(cause);
  return { type: normalized.type, message: normalized.message };
};

const captureError = async (error: any, isUnhandledRejection = false, eventContext: ErrorEventContext = {}) => {
  if (isSendingDisabled()) return;

  const normalized = normalizeReason(error);

  // Prefix with the type only when one is meaningfully present (matches prior behavior
  // where a bare `{ message }` produced just the message, while `TypeError` was prefixed).
  let message = normalized.isError || (error && error.name) ? `${normalized.type}: ${normalized.message}` : normalized.message;
  // Fall back to the event message (uncaught errors) so we never send an empty line.
  if (message === undefined || message === null || message === '') {
    message = eventContext.message || normalized.message;
  }

  if (isUnhandledRejection) {
    message = `Uncaught (in promise) ${message}`;
  }

  await generateLogLine({
    level: 'error',
    message,
    errorContext: {
      colno: error?.columnNumber || error?.colno || error?.colNo || eventContext.colno,
      lineno: error?.lineNumber || error?.lineno || error?.lineNo || eventContext.lineno,
      stacktrace: await utils.getStackTraceFromError(error),
      source: error?.fileName || error?.source || eventContext.filename,
      type: normalized.type,
      rawStack: typeof error?.stack === 'string' ? error.stack : undefined,
      cause: normalizeCause(error?.cause),
      reason: isUnhandledRejection ? normalized.reason : undefined,
      isUnhandledRejection: isUnhandledRejection || undefined,
    },
    disableStacktrace: !!(error?.stack || error?.stacktrace), // Don't generate a second stacktrace for errors since they already have it
  });
};

const generateLogLine = async ({ level = 'log', message, lineContext = {}, errorContext = null, disableStacktrace = false }: LogMessage) => {
  const opts = getOptions();

  // run the beforeSend hooks
  const data: LogMessage = (getOptions().hooks || { beforeSend: [] }).beforeSend.reduce((acc: LogMessage, fn: Function) => (acc == null ? null : fn(acc)), {
    level,
    message,
    lineContext,
  });

  // beforeSend stopped the log
  if (data == null) {
    return;
  }

  process({
    timestamp: Math.floor(Date.now() / 1000),
    app: opts.app || window.location.host,
    line: typeof data.message === 'string' ? data.message : utils.stringify(data.message),
    level: data.level,
    meta: {
      sessionId: getSessionId(),
      ...getStaticContext(),
      ...getDynamicContext(),
      stacktrace: disableStacktrace || !opts.enableStacktrace ? undefined : await utils.getStackTrace(),
      context: { ...getContext() },
      lineContext: data.lineContext,
      errorContext,
    },
  });
};

const internalErrorLogger = (...args: any[]) => {
  if (getOptions().disableInternalErrorLogger) return;

  if (utils.isFunction(getOptions().internalErrorLogger)) {
    // @ts-ignore
    getOptions().internalErrorLogger(...args);
    return;
  }
  const logLevel = getOptions().internalErrorLoggerLevel ?? 'error';
  return utils.originalConsole[logLevel](...args);
};

export { captureError, captureMessage, internalErrorLogger };
