import type DetachedWindowAPI from "happy-dom/lib/window/DetachedWindowAPI.js";
import type { CookieJar } from "tough-cookie";

declare global {
  const happyDOM: DetachedWindowAPI;
}

declare global {
  var cookieJar: CookieJar;
}
