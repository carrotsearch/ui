import { autoEffect, store } from "@risingstack/react-easy-state";
import storage from "store2";
import LRU from "lru-cache";

export const persistentStore = (key, defaults, methods) => {
  const resolvedDefaults = defaults instanceof Function ? defaults() : defaults;

  const backingStore = store(
    Object.assign({}, resolvedDefaults, storage.get(key), methods)
  );

  autoEffect(function () {
    storage.set(key, backingStore);
  });

  backingStore.resetToDefaults = () => {
    // Assume a flat object for now
    Object.keys(resolvedDefaults).forEach(prop => {
      backingStore[prop] = resolvedDefaults[prop];
    });
  };
  backingStore.getDefaults = () => resolvedDefaults;

  return backingStore;
};

export const persistentLruStore = (
  storeKey,
  itemKey,
  itemValue,
  maxItems = 1024
) => {
  const items = new LRU({ max: maxItems });
  items.load(storage.get(storeKey) || []);

  autoEffect(() => {
    const value = itemValue();
    if (value) {
      const computedKey = itemKey(value);
      if (computedKey) {
        items.set(computedKey, value);
        storage.set(storeKey, items.dump());
      }
    }
  });
  return items;
};

export const clearAllPersistentState = () => storage.clear();
