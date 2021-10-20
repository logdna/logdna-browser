import { addContext, getContext, getStaticContext, getDynamicContext } from '../src/context-manager';

import * as detectBrowser from 'detect-browser';

describe('context-manager.ts', () => {
  describe('addContext and getContext', () => {
    it('should set context', () => {
      addContext({
        user: 'Test user',
        account: 123,
      });

      expect(getContext()).toStrictEqual({
        user: 'Test user',
        account: 123,
      });
    });
  });

  describe('getStaticContext', () => {
    it('should get browser info', () => {
      jest.spyOn(detectBrowser, 'detect').mockImplementationOnce(() => ({
        version: '1',
        os: 'Linux',
        name: 'firefox',
        type: 'browser',
      }));

      expect(getStaticContext()).toStrictEqual({
        browser: {
          version: 'firefox-1',
          os: 'Linux',
          name: 'firefox',
          type: 'browser',
        },
      });
    });
  });

  describe('getDynamicContext', () => {
    it('should get location info', () => {
      expect(getDynamicContext()).toStrictEqual({
        location: expect.any(Object),
      });
    });
  });
});
