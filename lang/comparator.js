export const naturalComparator = (a, b) => {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else {
    return 0;
  }
};

export const comparatorOn = (fn, comparator) => {
  return (a, b) => {
    return comparator(fn(a), fn(b));
  };
}

export const naturalComparatorOn = prop => {
  return (a, b) => naturalComparator(a[prop], b[prop]);
};

export const chainedComparator = (...comparators) => {
  return (a, b) => {
    for (let c of comparators) {
      const comp = c(a, b);
      if (comp !== 0) {
        return comp;
      }
    }

    return 0;
  }
};

export const reversedComparator = comparator => {
  return (a, b) => -1 * comparator(a, b);
};
