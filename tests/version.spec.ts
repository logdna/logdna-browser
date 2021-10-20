import { getVersion } from '../src/version';

describe('version.ts', () => {
  describe('getVersion', () => {
    it('should return the pre-injected version', () => {
      expect(getVersion()).toEqual('{{{INJECT_VERSION}}}');
    });
  });
});
