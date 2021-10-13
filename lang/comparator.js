export const naturalComparator = (a, b) => {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else {
    return 0;
  }
};

export const naturalComparatorOn = prop => {
  return (a, b) => naturalComparator(a[prop], b[prop]);
};

export const reversedComparator = comparator => {
  return (a, b) => -1 * comparator(a, b);
};
