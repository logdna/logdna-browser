import Console from '../../src/plugins/console';
import * as capture from '../../src/capture';

const captureMessage = jest.spyOn(capture, 'captureMessage');
console.log = jest.fn();
console.debug = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();
console.info = jest.fn();

describe('console.ts', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should have a name property', () => {
    const consolePlugin = Console();
    expect(consolePlugin.name).toEqual('ConsolePlugin');
  });

  it('should throw an error if integration options is not an array', () => {
    //@ts-ignore
    const consolePlugin = Console({ integrations: 123 });
    //@ts-ignore
    expect(() => consolePlugin.init()).toThrowError();
  });

  it('should throw an error if integration contains an invalid log type', () => {
    //@ts-ignore
    const consolePlugin = Console({ integrations: ['wtf'] });
    //@ts-ignore
    expect(() => consolePlugin.init()).toThrowError();
  });

  describe('calling console methods', () => {
    const consolePlugin = Console();
    //@ts-ignore
    consolePlugin.init();
    it(`should call capture message`, () => {
      console.log('Testing');
      expect(captureMessage).toHaveBeenLastCalledWith({
        level: 'log',
        message: 'Testing',
      });
    });

    it(`should call capture message`, () => {
      console.error('Testing');
      expect(captureMessage).toHaveBeenLastCalledWith({
        level: 'error',
        message: 'Testing',
      });
    });

    it(`should call capture message`, () => {
      console.warn('Testing');
      expect(captureMessage).toHaveBeenLastCalledWith({
        level: 'warn',
        message: 'Testing',
      });
    });

    it(`should call capture message`, () => {
      console.debug('Testing');
      expect(captureMessage).toHaveBeenLastCalledWith({
        level: 'debug',
        message: 'Testing',
      });
    });

    it(`should call capture message`, () => {
      console.info('Testing');
      expect(captureMessage).toHaveBeenLastCalledWith({
        level: 'info',
        message: 'Testing',
      });
    });
  });
});
