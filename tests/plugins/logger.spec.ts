import Logger from '../../src/plugins/logger';
import utils from '../../src/utils';
import * as init from '../../src/init';
import * as capture from '../../src/capture';

const captureMessage = jest.spyOn(capture, 'captureMessage');

const logger = Logger();

describe('logger.ts', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should have a name property', () => {
    expect(logger.name).toEqual('LoggerPlugin');
  });

  it('should expose log methods', () => {
    const methods = logger.methods();

    expect(typeof methods.log).toEqual('function');
    expect(typeof methods.error).toEqual('function');
    expect(typeof methods.warn).toEqual('function');
    expect(typeof methods.debug).toEqual('function');
    expect(typeof methods.info).toEqual('function');
  });

  it('should call captureMessage with the correct log level and data', () => {
    const methods = logger.methods();
    methods.log('Message', { abc: 123 }, 'log');
    expect(captureMessage).toHaveBeenCalledTimes(1);
    expect(captureMessage).toHaveBeenCalledWith({
      level: 'log',
      message: 'Message',
      lineContext: { abc: 123 },
    });
  });

  it('should call captureMessage with the correct log level and data when message is an object', () => {
    const methods = logger.methods();
    methods.log({ test: 'Message' }, { abc: 123 }, 'log');
    expect(captureMessage).toHaveBeenCalledTimes(1);
    expect(captureMessage).toHaveBeenCalledWith({
      level: 'log',
      message: { test: 'Message' },
      lineContext: { abc: 123 },
    });
  });

  it('should call captureMessage with the correct log level and data', () => {
    const methods = logger.methods();
    methods.log('Message', { abc: 123 });
    expect(captureMessage).toHaveBeenCalledTimes(1);
    expect(captureMessage).toHaveBeenCalledWith({
      level: 'log',
      message: 'Message',
      lineContext: { abc: 123 },
    });
  });

  it('should call captureMessage with the correct log level and data', () => {
    const methods = logger.methods();
    methods.error('Message', { abc: 123 });
    expect(captureMessage).toHaveBeenCalledTimes(1);
    expect(captureMessage).toHaveBeenCalledWith({
      level: 'error',
      message: 'Message',
      lineContext: { abc: 123 },
    });
  });

  it('should call captureMessage with the correct log level and data', () => {
    const methods = logger.methods();
    methods.warn('Message', { abc: 123 });
    expect(captureMessage).toHaveBeenCalledTimes(1);
    expect(captureMessage).toHaveBeenCalledWith({
      level: 'warn',
      message: 'Message',
      lineContext: { abc: 123 },
    });
  });

  it('should call captureMessage with the correct log level and data', () => {
    const methods = logger.methods();
    methods.debug('Message', { abc: 123 });
    expect(captureMessage).toHaveBeenCalledTimes(1);
    expect(captureMessage).toHaveBeenCalledWith({
      level: 'debug',
      message: 'Message',
      lineContext: { abc: 123 },
    });
  });

  it('should call captureMessage with the correct log level and data', () => {
    const methods = logger.methods();
    methods.info('Message', { abc: 123 });
    expect(captureMessage).toHaveBeenCalledTimes(1);
    expect(captureMessage).toHaveBeenCalledWith({
      level: 'info',
      message: 'Message',
      lineContext: { abc: 123 },
    });
  });

  it('should call captureMessage once and send data to the browser console when debug is enabled', () => {
    jest.spyOn(init, 'getOptions').mockImplementationOnce(() => ({
      console: false,
      debug: true,
    }));
    utils.originalConsole.log = jest.fn();

    const methods = logger.methods();
    methods.log('Message', { abc: 123 });
    expect(captureMessage).toHaveBeenCalledTimes(1);
    expect(captureMessage).toHaveBeenCalledWith({
      level: 'log',
      message: 'Message',
      lineContext: { abc: 123 },
    });
    expect(utils.originalConsole.log).toHaveBeenLastCalledWith('Message', { abc: 123 });
  });

  it('should call captureMessage once and send data to the browser console when debug is enabled and filter line context when undefined', () => {
    jest.spyOn(init, 'getOptions').mockImplementationOnce(() => ({
      console: false,
      debug: true,
    }));
    utils.originalConsole.log = jest.fn();

    const methods = logger.methods();
    methods.log('Message');
    expect(captureMessage).toHaveBeenCalledTimes(1);
    expect(captureMessage).toHaveBeenCalledWith({
      level: 'log',
      message: 'Message',
    });
    expect(utils.originalConsole.log).toHaveBeenLastCalledWith('Message');
  });

  it('should call captureMessage once and not send data to the browser console when debug is false', () => {
    jest.spyOn(init, 'getOptions').mockImplementationOnce(() => ({
      console: false,
      debug: false,
    }));
    utils.originalConsole.log = jest.fn();

    const methods = logger.methods();
    methods.log('Message', { abc: 123 });
    expect(captureMessage).toHaveBeenCalledTimes(1);
    expect(captureMessage).toHaveBeenCalledWith({
      level: 'log',
      message: 'Message',
      lineContext: { abc: 123 },
    });
    expect(utils.originalConsole.log).toHaveBeenCalledTimes(0);
  });
});
