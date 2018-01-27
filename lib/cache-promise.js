import lruCache from 'lru-cache';

export const STATUS = {
  initialized: 'initialized',
  fetching: 'fetching',
  fetched: 'fetched',
  fetchFailed: 'fetch failed',
};

export class CacheItem {
  constructor(opts) {
    this.key = opts.key;
    this.value = opts.value;
    this.fetchFunction = opts.fetchFunction;
    this.init();
  }

  init(status = STATUS.initialized) {
    this.status = status;
    this.resolvers = [];
    this.rejectors = [];
    return this.rejectors;
  }

  fetch() {
    return Promise.resolve().then(() => {
      if (this.status === STATUS.fetchFailed) {
        this.init();
      }
      if (this.status === STATUS.fetched || !this.fetchFunction) {
        // Return the current value
        return this.value;
      }
      // Add a promise to the list of promises awaiting fetch completion
      const p = new Promise((resolve, reject) => {
        this.resolvers.push(resolve);
        return this.rejectors.push(reject);
      });
      if (this.status === STATUS.initialized) {
        // Call the fetch function
        this.status = STATUS.fetching;
        Promise.resolve().then(() => this.fetchFunction(this.key)).then((value) => {
          this.value = value;
          this.status = STATUS.fetched;
          const ref = this.resolvers;
          const results = [];
          for (let i = 0, len = ref.length; i < len; i++) {
            const r = ref[i];
            results.push(r(value));
          }
          this.init(this.status);
          return results;
        }).catch((err) => {
          this.status = STATUS.fetchFailed;
          const ref = this.rejectors;
          const results = [];
          for (let i = 0, len = ref.length; i < len; i++) {
            const r = ref[i];
            results.push(r(err));
          }
          this.init(this.status);
          return results;
        });
      }
      return p;
    });
  }
}

export default function (opts) {
  const cache = lruCache(opts);
  cache.getAsync = function getAsync(key, fetchFunction) {
    let item;
    item = cache.get(key);
    if (item === undefined && fetchFunction) {
      // Create a new cache item
      item = new CacheItem({
        key,
        fetchFunction,
      });
      cache.set(key, item);
    }
    if (!(item instanceof CacheItem)) {
      return Promise.resolve(item);
    }
    return item.fetch();
  };
  return cache;
}
