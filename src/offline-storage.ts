import utils from './utils';
const key = 'logdna::browser::offline-cache';

class OfflineStorage {
  hasLocalStorage: boolean = utils.isBrowserStorageAvailable('localStorage');

  getLines() {
    if (!this.hasLocalStorage) {
      return [];
    }

    const lines = window.localStorage.getItem(key);

    if (!lines) {
      return [];
    }

    try {
      return JSON.parse(lines);
    } catch (err) {
      return [];
    }
  }

  addLines(lines: any[]) {
    if (!this.hasLocalStorage) {
      return;
    }
    const stored = this.getLines();
    window.localStorage.setItem(key, JSON.stringify(stored.concat(lines)));
  }

  clear() {
    if (!this.hasLocalStorage) {
      return;
    }
    window.localStorage.removeItem(key);
  }
}

export default OfflineStorage;
