import type { CookieJar } from "tough-cookie";

declare global {
  // eslint-disable-next-line
  var cookieJar: CookieJar;
}
