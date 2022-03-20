import { LogLevel } from '../../src/logdna';
import SSN from '../../src/plugins/ssn-filter';

const ssnFilter = SSN();
const generateLogMessage = (message: any) => ({
  level: 'log' as LogLevel,
  message,
});

describe('ssn-filter.ts', () => {
  it('should have a name property', () => {
    expect(ssnFilter.name).toEqual('SSNFilterPlugin');
  });

  it('should return original message when no ssn present', () => {
    const message = 'No filtering here';
    const filter = ssnFilter.hooks.beforeSend(generateLogMessage(message));
    expect(filter.message).toEqual(message);
  });

  it('should filter SSN numbers from log messages', () => {
    const message = 'My SSN is 555-55-5555, got it';
    const filter = ssnFilter.hooks.beforeSend(generateLogMessage(message));
    expect(filter.message).toEqual('My SSN is XXX-XX-XXXX, got it');
  });

  it('should filter SSN numbers from log messages if shown twich', () => {
    const message = 'My SSN is 555-55-5555, got it. Again 111-11-1111';
    const filter = ssnFilter.hooks.beforeSend(generateLogMessage(message));
    expect(filter.message).toEqual('My SSN is XXX-XX-XXXX, got it. Again XXX-XX-XXXX');
  });

  it('should return original message when an object is the message', () => {
    const message = { asdf: 123 };
    const filter = ssnFilter.hooks.beforeSend(generateLogMessage(message));
    expect(filter.message).toStrictEqual(message);
  });

  it('should return original message when an array is the message', () => {
    const message = [1, 2, 3];
    const filter = ssnFilter.hooks.beforeSend(generateLogMessage(message));
    expect(filter.message).toStrictEqual(message);
  });

  it('should return original message when an number is the message', () => {
    const message = 123456789;
    const filter = ssnFilter.hooks.beforeSend(generateLogMessage(message));
    expect(filter.message).toStrictEqual(message);
  });
});
