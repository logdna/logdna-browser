import { init, getSessionId, setSessionId } from '../src/session-manager';
import utils from '../src/utils';

const SESSION_STORAGE_VALUE = 'stored-session-key';

describe('session-manager.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.sessionStorage.clear();
  });

  it('should generate sessionId if there is no session storage', () => {
    utils.isBrowserStorageAvailable = jest.fn(() => false);
    expect(getSessionId()).toBeUndefined();
    init();
    expect(getSessionId()).toEqual(expect.any(String));
  });

  it('should generate sessionId if there is no session storage', () => {
    utils.isBrowserStorageAvailable = jest.fn(() => true);
    init();
    expect(getSessionId()).toEqual(expect.any(String));
  });

  it('should set a custom session id', () => {
    init();
    setSessionId(SESSION_STORAGE_VALUE);
    expect(getSessionId()).toEqual(SESSION_STORAGE_VALUE);
  });
});
