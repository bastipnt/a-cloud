export const mergeUint8Arrays = (as: Uint8Array[]): Uint8Array => {
  const len = as.reduce((len, xs) => len + xs.length, 0);
  const result = new Uint8Array(len);
  as.reduce((n, xs) => (result.set(xs, n), n + xs.length), 0);
  return result;
};
