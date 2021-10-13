export const insertZWSPAtCamelCase = string => {
  const split = string.split(/(?=[A-Z])|(?<=[_])/);
  return split.join("​");
};
