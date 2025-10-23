export const arrayUniqueByKey = <T, K extends keyof T>(array: T[], key: K): T[] => {
  return [...new Map(array.map((item) => [item[key], item])).values()];
};

export const arrayUnique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};
