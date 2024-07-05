export const defer = fn => {
  setTimeout(fn, 0);
};

export const reduceToSet = array =>
  array.reduce((set, e) => {
    set.add(e);
    return set;
  }, new Set());

export const reduceToMap = (array, keyFn, valueFn = (e, i) => e) => {
  return array.reduce((map, e, i) => {
    map.set(keyFn(e, i), valueFn(e, i));
    return map;
  }, new Map());
};

export const isDefined = v => v !== null && v !== undefined;
