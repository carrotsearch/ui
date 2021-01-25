export const defer = fn => {
  setTimeout(fn, 0);
};

export const reduceToSet = array => array.reduce((set, e) => {
  set.add(e);
  return set;
}, new Set());

export const reduceToMap = (array, keyFn, valueFn = e => e) => {
  return array.reduce((map, e) => {
    map.set(keyFn(e), valueFn(e));
    return map;
  }, new Map());
};