import { Plugin, ILogDNABrowserLogger } from '../logdna.d';

export type Options = {
  enableErrorHandler?: boolean;
  enableUnhandledPromiseRejection?: boolean;
};

class GlobalErrorHandlerPlugin implements Plugin {
  name = 'GlobalErrorHandlerPlugin';
  logdna: any;
  options;

  constructor(
    options: Options = {
      enableErrorHandler: true,
      enableUnhandledPromiseRejection: true,
    },
  ) {
    this.options = options;
  }

  init(logdna: ILogDNABrowserLogger) {
    this.logdna = logdna;
    const {
      enableErrorHandler,
      enableUnhandledPromiseRejection,
    } = this.options;

    if (enableErrorHandler) {
      this.addGlobalError();
    }

    if (enableUnhandledPromiseRejection) {
      this.addUnhandledrejection();
    }
  }

  private addGlobalError() {
    window.addEventListener('error', this.onError, {
      capture: true,
    });
  }

  private addUnhandledrejection() {
    window.addEventListener('unhandledrejection', this.onUnhandledRejection, {
      capture: true,
    });
  }

  private onUnhandledRejection = (error: PromiseRejectionEvent) => {
    let { reason } = error;
    let message;

    if (reason instanceof Error) {
      message = reason.toString();
    } else {
      message = typeof reason === 'string' ? reason : JSON.stringify(reason);
    }

    this.logdna.error({
      errorMessage: message,
      message: `Uncaught (in promise) ${message}`,
      reason,
      error,
    });
  };

  private onError = (errorEvent: ErrorEvent) => {
    this.logdna.captureError(errorEvent);
  };
}

export default GlobalErrorHandlerPlugin;
