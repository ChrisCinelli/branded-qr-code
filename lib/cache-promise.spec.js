import lcp, { CacheItem } from './cache-promise';

global.Promise = require('bluebird');

const testKey = 'some key';

const testValue = {
  stuff: 'things',
};

function testFetchFunction() {}

const fetchError = new Error('Loud noises!');

function fetchFailed() {
  throw fetchError;
}

describe.only('cache-item tests', () => {
  let cacheItem = null;
  beforeEach(() => {
    cacheItem = new CacheItem({
      key: testKey,
      value: testValue,
      fetchFunction: testFetchFunction,
    });
  });
  describe('constructor', () => {
    it('Sets the key', () => expect(cacheItem.key).toBe(testKey));
    it('Sets the value', () => expect(cacheItem.value).toBe(testValue));
    it('Sets the fetch function', () => expect(cacheItem.fetchFunction).toBe(testFetchFunction));
    it('Sets the status to initialized', () => expect(cacheItem.status).toBe('initialized'));
    return it('Sets resolves and rejectors to empty arrays', () => {
      expect(cacheItem.resolvers).toEqual([]);
      return expect(cacheItem.rejectors).toEqual([]);
    });
  });
  return describe('fetch', () => {
    describe('when the item has a fetchFunction', () => {
      describe('and its value has not been fetched', () => it('calls the fetchFunction with the key as an argument', () => {
        cacheItem = new CacheItem({
          key: testKey,
          fetchFunction(key) {
            expect(key).toBe(testKey);
            return testValue;
          },
        });
        return cacheItem.fetch().then(result => expect(result).toBe(testValue));
      }));
      describe('and its value has been fetched', () => it('returns the cached value', () => {
        let fetchCallCount;
        fetchCallCount = 0;
        cacheItem = new CacheItem({
          key: testKey,
          fetchFunction() {
            fetchCallCount += 1;
            return testValue;
          },
        });
        return cacheItem.fetch().then(() => cacheItem.fetch()).then((result) => {
          expect(result).toBe(testValue);
          return expect(fetchCallCount).toBe(1);
        });
      }));
      describe('and it fails to fetch', () => {
        it('returns a promise which rejects when the fetch operation fails', () => {
          cacheItem = new CacheItem({
            key: testKey,
            fetchFunction: fetchFailed,
          });
          return cacheItem.fetch().then(() => {
            throw new Error('Expected fetch to fail');
          }).catch(err => expect(err).toBe(fetchError));
        });
        return describe('and a subsequent fetch call is made', () => it('tries to fetch again', () => {
          cacheItem = new CacheItem({
            key: testKey,
            fetchFunction: fetchFailed,
          });
          return cacheItem.fetch().then(() => {
            throw new Error('Expected fetch to fail');
          }).catch(() => {
            cacheItem.fetchFunction = function fetchFunction() {
              return testValue;
            };
            return cacheItem.fetch();
          }).then(result => expect(result).toBe(testValue));
        }));
      });
      return describe('and its value is being fetched', () => {
        describe('and the fetch is successful', () => {
          it('returns a promise which resolves when the fetch operation completes', () => {
            let fetchCallCount;
            fetchCallCount = 0;
            cacheItem = new CacheItem({
              key: testKey,
              fetchFunction() {
                fetchCallCount += 1;
                return Promise.delay(100).then(() => testValue);
              },
            });
            return Promise.all([
              cacheItem.fetch().then(result => expect(result).toBe(testValue)),
              cacheItem.fetch().then(result => expect(result).toBe(testValue)),
              cacheItem.fetch().then(result => expect(result).toBe(testValue)),
            ]).then(() => expect(fetchCallCount).toBe(1));
          });
          return it('removes references to the previous resolve/reject functions', () => {
            cacheItem = new CacheItem({
              key: testKey,
              fetchFunction() {
                return Promise.delay(100).then(() => testValue);
              },
            });
            return Promise.all([
              cacheItem.fetch(),
              cacheItem.fetch(),
              cacheItem.fetch(),
            ]).then(() => {
              expect(cacheItem.resolvers).toEqual([]);
              return expect(cacheItem.rejectors).toEqual([]);
            });
          });
        });
        return describe('and the fetch throws an error', () => it('returns a promise which rejects when the fetch operation fails', () => {
          let fetchCallCount = 0;
          const testError = new Error('Loud noises!');
          const testFailedError = new Error('Expected fetch to fail!');
          cacheItem = new CacheItem({
            key: testKey,
            fetchFunction() {
              fetchCallCount += 1;
              return Promise.delay(100).then(() => {
                throw testError;
              });
            },
          });
          const errors = [];
          function keepError(err) {
            return errors.push(err);
          }
          function testFailed() {
            throw testFailedError;
          }
          return Promise.all([
            cacheItem.fetch().then(testFailed).catch(keepError),
            cacheItem.fetch().then(testFailed).catch(keepError),
            cacheItem.fetch().then(testFailed).catch(keepError),
          ]).then(() => {
            expect(fetchCallCount).toBe(1);
            expect(errors.length).toBe(3);
            const results = [];
            for (let i = 0, len = errors.length; i < len; i++) {
              const e = errors[i];
              results.push(expect(e).toBe(testError));
            }
            return results;
          });
        }));
      });
    });
    return describe('when the item lacks a fetchFunction', () => it('returns its value', () => {
      cacheItem = new CacheItem({
        key: testKey,
        value: testValue,
      });
      return cacheItem.fetch().then(result => expect(result).toBe(testValue));
    }));
  });
});


describe.only('lru-cache-promise tests', () => describe('getAsync', () => {
  describe('when the key exists', () => {
    describe('and the value is not a CacheItem', () => it('returns the value', () => {
      const cache = lcp();
      cache.set(testKey, testValue);
      return cache.getAsync(testKey).then(result => expect(result).toBe(testValue));
    }));
    describe('and the value is a CacheItem', () => it('returns the value of the CacheItem', () => {
      const cache = lcp();
      return cache.getAsync(testKey, () => testValue).then((result) => {
        expect(result).toBe(testValue);
      });
    }));
    return describe('and multiple getAsync calls pile up', () => it('resolves the promises in the original order (FIFO)', () => {
      const cache = lcp();
      function fetchFunction() {
        Promise.delay(100);
        return testValue;
      }
      const resolved = [];
      return Promise.all([
        cache.getAsync(
          testKey,
          fetchFunction,
        ).then(() => resolved.push(1)),
        cache.getAsync(
          testKey,
          fetchFunction,
        ).then(() => resolved.push(2)),
        cache.getAsync(
          testKey,
          fetchFunction,
        ).then(() => resolved.push(3)),
      ]).then(() => expect(resolved).toEqual([1, 2, 3]));
    }));
  });
  return describe("when the key doesn't exist", () => it('returns undefined', () => {
    const cache = lcp();
    return cache.getAsync(testKey).then(result => expect(result).toBe(undefined));
  }));
}));
