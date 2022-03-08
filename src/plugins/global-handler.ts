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
  let error = {
    message: '<unknown>',
  };

  if ('reason' in e) {
    error = e.reason;
  } else if (e && e.detail && e.detail.reason) {
    error = e.detail.reason;
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
