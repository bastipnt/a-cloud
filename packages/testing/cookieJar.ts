import { Cookie, CookieJar } from "tough-cookie";

export const registerCookieJar = () => {
  const cookieJar = new CookieJar();

  globalThis.cookieJar = cookieJar;
};

export const parseCookie = (cookie: string) => Cookie.parse(cookie);

export const cookieFromJSON = (cookieJSON: string) => Cookie.fromJSON(cookieJSON);

export const splitCookies = (setCookieHeader: string) => setCookieHeader.split(/,(?=\s*\w+=)/);
