import { config } from "@acloud/config";
import { routes } from "@acloud/server/routes";
import { parseCookie, splitCookies } from "@acloud/testing";
import { treaty } from "@elysiajs/eden";
import { mock } from "bun:test";

const url = config.endpoint.api;

mock.module("./api", () => {
  const api = treaty(routes, {
    fetch: { credentials: "include" },
    async onRequest() {
      const cookies = await cookieJar.getCookies(url);

      if (cookies.length > 0) {
        const cookie = cookies[0]?.toString();

        return {
          headers: {
            cookie,
          },
        };
      }

      return;
    },
    async onResponse(response) {
      const rawCookies = response.headers.get("set-cookie");

      if (rawCookies) {
        const cookies = splitCookies(rawCookies).map(parseCookie);

        for (const cookie of cookies) {
          if (cookie) await cookieJar.setCookie(cookie, url);
        }
      }
    },
  });

  return {
    api: {
      ...api,
      user: {
        index: {
          get: mock(api.user.index.get),
        },
      },
      "user-auth": {
        ...api["user-auth"],
        "sign-in": {
          post: mock(api["user-auth"]["sign-in"].post),
          "verify-srp": {
            post: mock(api["user-auth"]["sign-in"]["verify-srp"].post),
          },
        },
        "sign-up": {
          put: mock(api["user-auth"]["sign-up"].put),
        },
        "verify-ott": {
          post: mock(api["user-auth"]["verify-ott"].post),
        },
        "finish-sign-up": {
          put: mock(api["user-auth"]["finish-sign-up"].put),
        },
      },
    } as typeof api,
  };
});
