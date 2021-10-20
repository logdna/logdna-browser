import utils from '../src/utils';
console.error = jest.fn();

describe('Utils', () => {
  describe('validateHostname', () => {
    ['123@!#!@', '--', 'my-app-', 'app_asdf'].forEach(hostname => {
      it('should throw error with invalid hostname', () => {
        expect(utils.validateHostname(hostname)).toBeFalsy();
      });
    });

    ['logdna-web', 'web', 'my-app-a', 'asdf.asdf.asdf'].forEach(hostname => {
      it('should return true with a valid host name', () => {
        expect(utils.validateHostname(hostname)).toBeTruthy();
      });
    });
  });

  describe('safe stringify', () => {
    it('should remove functions and symbols when stringifying the data and clean up circular references', () => {
      let obj: any = {};
      obj.obj = obj;
      let encode = {
        data: {
          obj,
          symbol: Symbol('test'),
          fn() {
            return;
          },
        },
      };
      expect(utils.stringify(encode)).toEqual('{"data":{"obj":{"obj":"[Circular]"}}}');
    });
  });

  describe('jsonByteSize', () => {
    beforeEach(() => {
      // TextEncoder isnt supported in jsdom, this mimics it.
      const { TextEncoder } = require('util');
      // @ts-ignore
      global.TextEncoder = TextEncoder;
    });
    it('should return the byte size of a json object', () => {
      const obj = {
        value: 123,
      };
      expect(utils.jsonByteSize(obj)).toEqual(13);
    });

    it('should return the byte size of a json object', () => {
      const obj = {
        value: 123,
        more: {
          items: 'bigger size',
        },
      };
      expect(utils.jsonByteSize(obj)).toEqual(44);
    });

    it('should return the correct size and not have cyclical errors', () => {
      let obj: any = {};
      obj.obj = obj;
      let encode = {
        obj: {
          obj,
        },
      };

      expect(utils.jsonByteSize(encode)).toEqual(36);
    });

    it('should return the correct size and not have cyclical errors and not error when stringifying Functions, Dates, Symbols', () => {
      let obj: any = {};
      obj.obj = obj;
      let encode = {
        obj: {
          obj,
          symbol: Symbol('test'),
          date: new Date(),
          fn() {
            return;
          },
        },
      };
      expect(utils.jsonByteSize(encode)).toEqual(70);
    });

    it('should return the byte size of a json object with Blob', () => {
      // @ts-ignore
      global.TextEncoder = null;
      const obj = {
        value: 123,
      };
      expect(utils.jsonByteSize(obj)).toEqual(13);
    });
  });

  describe('generateSampleRateScore', () => {
    let score: number;
    it('should generate a random number', () => {
      score = utils.generateSampleRateScore();
      expect(score).toEqual(expect.any(Number));
    });

    it('should get the sampleRateScore from sessionStorage', () => {
      expect(utils.generateSampleRateScore()).toBe(score);
    });
  });

  describe('includeInSampleRate', () => {
    it('with an non-numeric sample rate it should always return false', () => {
      ['asdf', '123*(U'].forEach(rate => {
        //@ts-expect-error
        expect(utils.includeInSampleRate(rate, 100)).toBeFalsy();
      });
    });

    it('with a sample rate of 0 should always return false', () => {
      [1, 2, 3, 4, 5, 100].forEach(score => {
        expect(utils.includeInSampleRate(0, score)).toBeFalsy();
      });
    });

    it('with a sample rate of 100 should always return true', () => {
      [0, 1, 2, 3, 4, 5, 100].forEach(score => {
        expect(utils.includeInSampleRate(100, score)).toBeTruthy();
      });
    });

    const sampleRate = 5;
    it('with a 5% sample rate the following scores should be included', () => {
      [0, 1, 2, 3, 4, 5].forEach(score => {
        expect(utils.includeInSampleRate(sampleRate, score)).toBeTruthy();
      });
    });

    it('with a 5% sample rate the following scores should not be included', () => {
      [6, 10, 50, 90, 100].forEach(score => {
        expect(utils.includeInSampleRate(sampleRate, score)).toBeFalsy();
      });
    });
  });

  describe('parseTags', () => {
    it('should add LogDNA-Browser when no tags are passed', () => {
      const tags = utils.parseTags();
      expect(tags).toEqual('LogDNA-Browser');
    });

    it('should add LogDNA-Browser along with the string of tags', () => {
      const tags = utils.parseTags('tag');
      expect(tags).toEqual('LogDNA-Browser,tag');
    });

    it('should add LogDNA-Browser when passing an array of tags', () => {
      const tags = utils.parseTags(['tag1', 'tag2']);
      expect(tags).toEqual('LogDNA-Browser,tag1,tag2');
    });

    it('should pass LogDNA-Browser as a tag and show a console error when passing non string', () => {
      //@ts-ignore
      expect(() => utils.parseTags(123)).toThrowError();
    });

    it('should pass LogDNA-Browser as a tag and show a console error when passing an array with non string values', () => {
      //@ts-ignore
      expect(() => utils.parseTags(['abc', 123])).toThrowError();
    });
  });

  describe('BackOff With Jitter', () => {
    const base = 1000;
    const cap = 2000;
    let lastSleep = base;
    it(`should return a random value between ${base} and ${cap}`, () => {
      const val = utils.backOffWithJitter(base, cap, lastSleep);
      expect(val).toBeLessThanOrEqual(cap);
      expect(val).toBeGreaterThanOrEqual(base);
    });
  });
});
