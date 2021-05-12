import Console, { DEFAULT_CONSOLE_METHODS } from '../../src/plugins/console';

//@ts-ignore
window.__LogDNA__ = {};

describe('Console Plugin', () => {
  let logdna: any;

  describe('when passed incorrect params', () => {
    const console = new Console({
      //@ts-ignore
      integrations: 'wrong',
    });
    it('show throw error when integrations options is not an array', () => {
      // @ts-ignore
      expect(() => console.init()).toThrow();
    });
  });

  describe('', () => {
    it('should not call log lines when passed an invalid console method', () => {
      logdna = {
        logLines: jest.fn(),
      };
      const console = new Console({
        //@ts-ignore
        integrations: ['wah'],
      });
      // @ts-ignore
      expect(() => console.init()).toThrow();
    });
  });

  describe('when initialized', () => {
    beforeEach(() => {
      logdna = {
        logLines: jest.fn(),
      };
      //@ts-ignore
      window.console = DEFAULT_CONSOLE_METHODS.reduce((acc: any, method) => {
        acc[method] = jest.fn();
        return acc;
      }, {});
    });

    DEFAULT_CONSOLE_METHODS.forEach((method: string) => {
      it('should override the default console methods', () => {
        const console = new Console();
        console.init(logdna);
        // @ts-ignore
        window.console[method]('test message');
        expect(logdna.logLines).toHaveBeenCalledWith(method, 'test message');
      });
    });

    describe('when overriding only log and error methods', () => {
      const integrations: any = ['log', 'error'];
      const notIntegrations: any = ['debug', 'warn', 'info', 'assert'];
      it('should call log lines', () => {
        const console = new Console({
          integrations,
        });
        console.init(logdna);

        integrations.forEach((method: string) => {
          // @ts-ignore
          window.console[method]('test message');
          expect(logdna.logLines).toHaveBeenCalledWith(method, 'test message');
        });
      });

      it('should not call log lines', () => {
        const console = new Console({
          integrations,
        });
        console.init(logdna);

        notIntegrations.forEach((method: string) => {
          // @ts-ignore
          window.console[method]('test message');
          expect(logdna.logLines).toHaveBeenCalledTimes(0);
        });
      });
    });
  });
});
