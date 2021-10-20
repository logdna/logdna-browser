import { getContext } from './context-manager';
import { getOptions } from './init';
import { getInstalledPlugins } from './plugin-manager';
import { getSessionId } from './session-manager';
import { getVersion } from './version';

type LogDNAWindow = {
  version: string;
  getContext: Function;
  getOptions: Function;
  getInstalledPlugins: Function;
  getSessionId: Function;
};

declare global {
  interface Window {
    __LOGDNA__: LogDNAWindow;
  }
}

export const addDebugInfo = () => {
  if (typeof window !== 'undefined') {
    window.__LOGDNA__ = window.__LOGDNA__ || {
      version: getVersion(),
      getContext,
      getOptions,
      getInstalledPlugins,
      getSessionId,
    };
  }
};
