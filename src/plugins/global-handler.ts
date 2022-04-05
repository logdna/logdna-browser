import { captureError } from '../capture';
import { Plugin } from '../logdna';

export type GlobalErrorHandlerPlugin =
  | {
      enableErrorHandler?: boolean;
      enableUnhandledPromiseRejection?: boolean;
    }
  | undefined;

const DEFAULT_OPTIONS = {
  enableErrorHandler: true,
  enableUnhandledPromiseRejection: true,
};

const addGlobalError = () => {
  window.addEventListener('error', onError);
};

const addUnhandledrejection = () => {
  window.addEventListener('unhandledrejection', onUnhandledRejection, {
    capture: true,
  });
};

/*  istanbul ignore next */
const onUnhandledRejection = (e: any) => {
  let error = e;
  let reason;

  if ('reason' in e) {
    reason = e.reason;
  } else if (e && e.detail && e.detail.reason) {
    reason = e.detail.reason;
  }

  if (reason instanceof Error) {
    error = reason;
  } else if (typeof reason === 'string') {
    error.message = reason;
  } else {
    error.message = '<unknown>';
  }

  error.message = `Uncaught (in promise) ${error.message}`;

  captureError(error);
};

/*  istanbul ignore next */
const onError = (error: ErrorEvent) => {
  const e = error?.error ?? error ?? {};
  captureError(e);
};

const GlobalErrorHandler = (opts: GlobalErrorHandlerPlugin = DEFAULT_OPTIONS): Plugin => ({
  name: 'GlobalErrorHandlerPlugin',
  init() {
    if (opts.enableErrorHandler) {
      addGlobalError();
    }

    if (opts.enableUnhandledPromiseRejection) {
      addUnhandledrejection();
    }
  },
});

export default GlobalErrorHandler;
