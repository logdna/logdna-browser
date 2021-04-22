import SessionManager from '../src/session-manager';

describe('Session manager', () => {
  beforeEach(() => {
    jest.spyOn(window.sessionStorage.__proto__, 'setItem');
    window.sessionStorage.__proto__.setItem = jest.fn();

    jest.spyOn(window.sessionStorage.__proto__, 'getItem');
    window.sessionStorage.__proto__.getItem = jest.fn();
  });

  it('should create a new session id and store it in session storage', () => {
    new SessionManager();
    expect(sessionStorage.getItem).toBeCalledTimes(1);
    expect(sessionStorage.setItem).toBeCalledTimes(2);
  });

  it('should set custom sessionid return it when calling .get', () => {
    const sessionManager = new SessionManager();

    sessionManager.set('123');
    // one in constructor, one in setter.
    expect(sessionStorage.setItem).toBeCalledTimes(3);
    expect(sessionManager.get()).toEqual('123');
  });

  it('should create a new sessionid', () => {
    const sessionManager = new SessionManager();

    // @ts-ignore
    sessionManager.create();
    // one in constructor, one in setter.
    expect(sessionStorage.setItem).toBeCalledTimes(3);
    expect(sessionManager.get()).toBeDefined();
  });
});
