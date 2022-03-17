// All messages run through here
import { isSendingDisabled, getOptions } from './init';
import { process } from './buffer-manager';
import utils from './utils';
import { getStaticContext, getContext, getDynamicContext } from './context-manager';
import { getSessionId } from './session-manager';
import { LogMessage, LogDNALogLine } from './logdna';

const captureMessage = ({ level = 'log', message, lineContext = {} }: LogMessage) => {
  if (isSendingDisabled()) return;

  if (message instanceof Error) {
    captureError(message);
    return;
  }

  // run the beforeSend hooks
  const data: LogMessage = (getOptions().hooks || { beforeSend: [] }).beforeSend.reduce((acc, fn) => (acc == null ? null : fn(acc)), {
    level,
    message,
    lineContext,
  });

  // beforeSend stopped the log
  if (data == null) {
    return;
  }

  const logLine: LogDNALogLine = generateLogLine(data);

  process(logLine);
};

const captureError = (error: any) => {
  if (isSendingDisabled()) return;

  const logLine: LogDNALogLine = generateLogLine({
    level: 'error',
    message: error.message,
    errorContext: {
      colno: error.columnNumber || error.colno || error.colNo,
      lineno: error.lineNumber || error.lineno || error.lineNo,
      stacktrace: error.stack || error.stacktrace,
      source: error.fileName || error.source,
    },
    disableStacktrace: !!(error.stack || error.stacktrace), // Dont generate a second stacktrace for errors since they already have it
  });

  process(logLine);
};

const generateLogLine = ({ level = 'log', message, lineContext = {}, errorContext = {}, disableStacktrace = false }: LogMessage): LogDNALogLine => {
  const opts = getOptions();
  return {
    timestamp: Math.floor(Date.now() / 1000),
    app: opts.app || window.location.host,
    line: typeof message === 'string' ? message : utils.stringify(message),
    level,
    meta: {
      sessionId: getSessionId(),
      ...getStaticContext(),
      ...getDynamicContext(),
      stacktrace: disableStacktrace || !opts.enableStacktrace ? undefined : utils.getStackTrace(),
      context: { ...getContext() },
      lineContext,
      errorContext,
    },
  };
};

const internalErrorLogger = (...args: any[]) => {
  if (utils.isFunction(getOptions().internalErrorLogger)) {
    // @ts-ignore
    getOptions().internalErrorLogger(...args);
    return;
  }
  return utils.originalConsole.error(...args);
};

export { captureError, captureMessage, internalErrorLogger };
