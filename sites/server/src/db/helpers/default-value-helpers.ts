export const getDateNow = () => new Date();

/**
 *
 * @param minsInFuture minutes added to the current date
 * @returns a date minsInFuture minutes in the future
 */
export const getFutureDate = (minsInFuture: number) =>
  new Date(Date.now() + minsInFuture * 60 * 1000);
