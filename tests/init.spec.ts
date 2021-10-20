import { config, init, getOptions, isSendingDisabled, isConfigured, isInitiated } from '../src/init';

import utils from '../src/utils';
import { LOG_LINE_FLUSH_TIMEOUT } from '../src/constants';
import * as pluginManager from '../src/plugin-manager';

const addPluginMethods = jest.spyOn(pluginManager, 'addPluginMethods').mockImplementationOnce(() => {});
const initPlugins = jest.spyOn(pluginManager, 'initPlugins').mockImplementation(() => {});
const addDefaultPlugins = jest.spyOn(pluginManager, 'addDefaultPlugins').mockImplementationOnce(() => {});

const INGESTION_KEY = 'test-key';

describe('init.ts', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('config', () => {
    it('should set isConfigComplete', () => {
      expect(isConfigured()).toBeFalsy();
      config(INGESTION_KEY);
      expect(isConfigured()).toBeTruthy();
    });

    it('should set ingestion key in options', () => {
      config(INGESTION_KEY);
      expect(getOptions().ingestionKey).toEqual(INGESTION_KEY);
    });

    it('should set add tags in options', () => {
      config(INGESTION_KEY, { tags: ['another-tag'] });
      expect(getOptions().tags).toEqual('LogDNA-Browser,another-tag');
    });

    it('should set flush interval', () => {
      config(INGESTION_KEY, { flushInterval: 1000 });
      expect(getOptions().flushInterval).toEqual(1000);
    });

    it('should set flush interval to default value', () => {
      //@ts-ignore
      config(INGESTION_KEY, { flushInterval: 'asdf' });
      expect(getOptions().flushInterval).toEqual(LOG_LINE_FLUSH_TIMEOUT);

      //@ts-ignore
      config(INGESTION_KEY, { flushInterval: LOG_LINE_FLUSH_TIMEOUT - 1 });
      expect(getOptions().flushInterval).toEqual(LOG_LINE_FLUSH_TIMEOUT);

      //@ts-ignore
      config(INGESTION_KEY, { flushInterval: null });
      expect(getOptions().flushInterval).toEqual(LOG_LINE_FLUSH_TIMEOUT);
    });

    it('should add the default plugins and add plugin methods', () => {
      config(INGESTION_KEY);
      expect(addDefaultPlugins).toHaveBeenCalled();
      expect(addPluginMethods).toHaveBeenCalled();
    });
  });

  describe('init', () => {
    it('should not set isInitComplete when disabled', () => {
      init(INGESTION_KEY, { disabled: true });
      expect(initPlugins).toHaveBeenCalledTimes(0);
      expect(isInitiated()).toBeFalsy();
      expect(isSendingDisabled()).toBeTruthy();
      init(INGESTION_KEY, { disabled: false });
    });

    it('should set ingestion key in options', () => {
      init(INGESTION_KEY);
      expect(getOptions().ingestionKey).toEqual(INGESTION_KEY);
    });

    it('should set ingestion key in options', () => {
      window.addEventListener = jest.fn();
      document.addEventListener = jest.fn();
      init(INGESTION_KEY);
      expect(window.addEventListener).toHaveBeenNthCalledWith(1, 'beforeunload', expect.any(Function));
      expect(document.addEventListener).toHaveBeenNthCalledWith(1, 'visibilitychange', expect.any(Function));
    });
  });

  describe('isSendingDisabled', () => {
    it('should not be disabled', () => {
      expect(isSendingDisabled()).toBeFalsy();
    });

    it('should not be disabled', () => {
      utils.generateSampleRateScore = jest.fn(() => 1);
      init(INGESTION_KEY, { sampleRate: 50 });
      expect(isSendingDisabled()).toBeFalsy();
    });

    it('should not be disabled', () => {
      utils.generateSampleRateScore = jest.fn(() => 51);
      init(INGESTION_KEY, { sampleRate: 50 });
      expect(isSendingDisabled()).toBeTruthy();
    });

    it('should not be disabled', () => {
      init(INGESTION_KEY, { disabled: true });
      expect(isSendingDisabled()).toBeTruthy();
      init(INGESTION_KEY, { disabled: false });
    });
  });
});
