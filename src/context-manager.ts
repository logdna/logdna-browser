import { detect } from 'detect-browser';
import { Context } from './logdna';

type LogDNABrowserInfo = {
  version: string;
};

type StaticContext = {
  browser: LogDNABrowserInfo;
};

let context: Context = {};

const addContext = (_context: Context) => {
  context = _context;
};

const getContext = () => context;

const getDynamicContext = () => ({
  location: window.location,
});

const getStaticContext = (): StaticContext | undefined => {
  const browser = detect();

  if (browser == null) {
    return;
  }

  return {
    browser: {
      ...browser,
      version: `${browser.name}-${browser.version}`,
    },
  };
};

export { addContext, getContext, getStaticContext, getDynamicContext };
