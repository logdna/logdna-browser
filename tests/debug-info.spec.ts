import { addDebugInfo } from '../src/debug-info';

describe('debug-info.ts', () => {
  describe('addDebugInfo', () => {
    it('should return the debug object', () => {
      addDebugInfo();
      expect(window.__LOGDNA__).toEqual(expect.any(Object));
      expect(window.__LOGDNA__.version).toEqual(expect.any(String));
      expect(window.__LOGDNA__.getContext).toEqual(expect.any(Function));
      expect(window.__LOGDNA__.getOptions).toEqual(expect.any(Function));
      expect(window.__LOGDNA__.getInstalledPlugins).toEqual(expect.any(Function));
      expect(window.__LOGDNA__.getSessionId).toEqual(expect.any(Function));
    });
  });
});
