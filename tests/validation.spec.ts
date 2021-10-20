import { validateOptions } from '../src/validation';
import { DEFAULT_CONFIG } from '../src/constants';

const getOptions = (opts = {}) => ({ ...DEFAULT_CONFIG, ...opts });

describe('validation.ts', () => {
  describe('validateOptions', () => {
    describe('ingestion key', () => {
      it('should throw an error if no ingestion key is provided', () => {
        expect(() => validateOptions(getOptions())).toThrowError('Ingestion key can not be undefined when calling init');
      });
    });

    describe('hostname', () => {
      it('should throw an for if no host name is provided', () => {
        const options = getOptions({
          hostname: undefined,
          ingestionKey: '123',
        });
        expect(() => validateOptions(options)).toThrowError(
          `LogDNA Browser Logger: \`${options.hostname}\` is not a valid hostname, see documentation for the \`hostname\` configuration option for details.`,
        );
      });

      it('should throw an for invalid host name', () => {
        const options = getOptions({
          ingestionKey: '123',
          hostname: '%^&*(',
        });
        expect(() => validateOptions(options)).toThrowError(
          `LogDNA Browser Logger: \`${options.hostname}\` is not a valid hostname, see documentation for the \`hostname\` configuration option for details.`,
        );
      });
    });

    describe('sampleRate', () => {
      it('should throw an if there is no sample rate', () => {
        const options = getOptions({
          ingestionKey: '123',
          sampleRate: undefined,
        });
        expect(() => validateOptions(options)).toThrowError(`LogDNA Browser Logger: \`sampleRate\` option must be a number between 0 and 100`);
      });

      it('should throw an if sample rate is negative number', () => {
        const options = getOptions({
          ingestionKey: '123',
          sampleRate: -100,
        });
        expect(() => validateOptions(options)).toThrowError(`LogDNA Browser Logger: \`sampleRate\` option must be a number between 0 and 100`);
      });

      it('should throw an if sample rate is greater than 100', () => {
        const options = getOptions({
          ingestionKey: '123',
          sampleRate: 101,
        });
        expect(() => validateOptions(options)).toThrowError(`LogDNA Browser Logger: \`sampleRate\` option must be a number between 0 and 100`);
      });

      it('should throw an if sample rate is NaN', () => {
        const options = getOptions({
          ingestionKey: '123',
          sampleRate: 'what?',
        });
        expect(() => validateOptions(options)).toThrowError(`LogDNA Browser Logger: \`sampleRate\` option must be a number between 0 and 100`);
      });
    });

    describe('valid state', () => {
      it('should not throw when all options are valid', () => {
        const options = getOptions({
          ingestionKey: '123',
          hostname: 'my-host-name',
          sampleRate: 10,
        });
        expect(() => validateOptions(options)).not.toThrowError();
      });
    });
  });
});
