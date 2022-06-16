// All messages run through here
import { isSendingDisabled, getOptions } from './init';
import { process } from './buffer-manager';
import utils from './utils';
import { getStaticContext, getContext, getDynamicContext } from './context-manager';
import { getSessionId } from './session-manager';
import { LogMessage } from './logdna';

const captureMessage = ({ level = 'log', message, lineContext = {} }: LogMessage) => {
  if (isSendingDisabled()) return;

  if (message instanceof Error) {
    captureError(message);
    return;
  }

  generateLogLine({ level, message, lineContext });
};

const captureError = (error: any, isUnhandledRejection = false) => {
  if (isSendingDisabled()) return;

  let message = error.name ? `${error.name}: ${error.message}` : error.message;

  if (isUnhandledRejection) {
    message = `Uncaught (in promise) ${message}`;
  }

  generateLogLine({
    level: 'error',
    message,
    errorContext: {
      colno: error.columnNumber || error.colno || error.colNo,
      lineno: error.lineNumber || error.lineno || error.lineNo,
      stacktrace: error.stack || error.stacktrace,
      source: error.fileName || error.source,
    },
    disableStacktrace: !!(error.stack || error.stacktrace), // Don't generate a second stacktrace for errors since they already have it
  });
};

const generateLogLine = ({ level = 'log', message, lineContext = {}, errorContext = null, disableStacktrace = false }: LogMessage) => {
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
      stacktrace: disableStacktrace || !opts.enableStacktrace ? undefined : utils.getStackTrace(),
      context: { ...getContext() },
      lineContext: data.lineContext,
      errorContext,
    },
  });
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
