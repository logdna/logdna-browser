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
const onUnhandledRejection = (event: PromiseRejectionEvent) => {
  captureError(event?.reason, true);
};

/*  istanbul ignore next */
const onError = (event: ErrorEvent) => {
  // Prefer the underlying Error (carries name/message/stack), but keep the event's
  // own position fields — Chromium Errors don't expose filename/lineno/colno.
  const error = event?.error ?? event ?? {};
  captureError(error, false, {
    message: event?.message,
    filename: event?.filename,
    lineno: event?.lineno,
    colno: event?.colno,
  });
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
