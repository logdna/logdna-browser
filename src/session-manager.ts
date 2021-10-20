import utils from './utils';
import { SESSION_KEY } from './constants';

import { SessionId } from './logdna';

let sessionId: SessionId;

const hasSessionStorage = (): Boolean => utils.isBrowserStorageAvailable('sessionStorage');

// taken from https://gist.github.com/jed/982883
const generate = (): string => {
  return ('' + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/1|0/g, function() {
    return (0 | (Math.random() * 16)).toString(16);
  });
};

const init = () => {
  if (!hasSessionStorage()) {
    setSessionId(generate());
  } else {
    const storage = window.sessionStorage.getItem(SESSION_KEY);
    sessionId = storage || generate();
  }
};

const setSessionId = (id: SessionId) => {
  if (hasSessionStorage()) {
    window.sessionStorage.setItem(SESSION_KEY, id);
  }

  sessionId = id;
};

const getSessionId = (): SessionId => sessionId;

export { init, getSessionId, setSessionId };
