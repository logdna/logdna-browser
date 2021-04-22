import utils from './utils';
const SESSION_KEY = 'logdna::browser::sessionid';

class SessionManager {
  sessionId?: string;
  hasSessionStorage: boolean = utils.isBrowserStorageAvailable(
    'sessionStorage',
  );

  constructor() {
    if (!this.hasSessionStorage) {
      this.sessionId = this.create();
    } else {
      const storage = window.sessionStorage.getItem(SESSION_KEY);

      this.sessionId = storage || this.create();
    }
    return this;
  }

  get() {
    return this.sessionId;
  }

  set(sessionId: string) {
    if (this.hasSessionStorage) {
      window.sessionStorage.setItem(SESSION_KEY, sessionId);
    }

    this.sessionId = sessionId;
  }

  private create() {
    const newSessionId = this.generate();
    this.set(newSessionId);
    return newSessionId;
  }

  // taken from https://gist.github.com/jed/982883
  private generate() {
    return ('' + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/1|0/g, function() {
      return (0 | (Math.random() * 16)).toString(16);
    });
  }
}

export default SessionManager;
