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
    try {
      window.localStorage.setItem(key, JSON.stringify(stored.concat(lines)));
    } catch (error) {
      // This is to catch quota errors but we dont want to log them.
    }
  }

  clear() {
    if (!this.hasLocalStorage) {
      return;
    }
    window.localStorage.removeItem(key);
  }
}

export default OfflineStorage;
