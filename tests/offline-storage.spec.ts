import OfflineStorage from '../src/offline-storage';

describe('Offline Storage', () => {
  let offlineStorage: OfflineStorage;
  beforeEach(() => {
    offlineStorage = new OfflineStorage();
    offlineStorage.clear();
  });

  describe('getLines', () => {
    it('should return empty array when not supported', () => {
      offlineStorage.hasLocalStorage = false;
      expect(offlineStorage.getLines()).toEqual([]);
    });

    it('should return items when set', () => {
      offlineStorage.addLines([{ test: 123 }]);
      const storedItems = offlineStorage.getLines();
      expect(storedItems.length).toEqual(1);
      expect(storedItems).toEqual([{ test: 123 }]);
    });

    it('should return all items when more lines are added', () => {
      offlineStorage.addLines([{ first: 123 }]);
      offlineStorage.addLines([{ second: 123 }]);
      const storedItems = offlineStorage.getLines();
      expect(storedItems.length).toEqual(2);
    });

    it('should return empty array when json parse fails', () => {
      window.localStorage.setItem('logdna::browser::offline-cache', 'badparse');
      const storedItems = offlineStorage.getLines();
      expect(storedItems).toEqual([]);
    });
  });

  describe('addLines', () => {
    it('should return undefined when not supported', () => {
      offlineStorage.hasLocalStorage = false;
      expect(offlineStorage.addLines([])).toBeFalsy();
    });
  });

  describe('clear', () => {
    it('should return undefined when not supported', () => {
      offlineStorage.hasLocalStorage = false;
      expect(offlineStorage.clear()).toBeFalsy();
    });

    it('should clear the items when called', () => {
      offlineStorage.addLines([{ test: 123 }]);
      const storedItems = offlineStorage.getLines();
      expect(storedItems.length).toEqual(1);
      offlineStorage.clear();
      expect(offlineStorage.getLines()).toEqual([]);
    });
  });
});
