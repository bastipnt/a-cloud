import { App } from "@acloud/server";
import type { Treaty } from "@elysiajs/eden";
import { vi } from "vitest";

vi.mock("@acloud/client/api", async () => {
  console.log("mock api");

  // const { treaty } = await import("@elysiajs/eden");
  // const { config } = await import("@acloud/config");
  // const { routes } = await import("@acloud/server/routes");
  // const { parseCookie, splitCookies } = await import("@acloud/testing");

  // const url = config.endpoint.api;
  // let cookies: Cookie[];

  // const api = treaty(routes, {
  //   fetch: { credentials: "include" },
  //   async onRequest() {
  //     cookies = await cookieJar.getCookies(url);

  //     console.log({ cookies });

  //     if (cookies.length > 0) {
  //       const cookie = cookies[0]?.toString();

  //       if (cookie)
  //         return {
  //           headers: {
  //             cookie,
  //           },
  //         };
  //     }

  //     return;
  //   },
  //   async onResponse(response) {
  //     const rawCookies = response.headers.get("set-cookie");

  //     console.log(response.headers);

  //     console.log({ response, rawCookies });

  //     if (rawCookies) {
  //       const cookies = splitCookies(rawCookies).map(parseCookie);

  //       for (const cookie of cookies) {
  //         if (cookie) await cookieJar.setCookie(cookie, url);
  //       }
  //     }
  //   },
  // });
  const api: Treaty.Create<App> = {
    user: {
      get: vi
        .fn()
        .mockReturnValue({ status: 401, data: { success: false, message: "Unauthorized" } }),
      "sign-out": {
        post: vi.fn(),
      },
    },
    "user-auth": {
      "sign-in": {
        post: vi.fn(),
        "verify-srp": {
          post: vi.fn(),
        },
      },
      "sign-up": {
        put: vi.fn(),
      },
      "verify-ott": {
        post: vi.fn(),
      },
      "finish-sign-up": {
        put: vi.fn(),
      },
    },
    // @ts-expect-error files also is an object
    files(_params: any) {
      return {
        get: vi.fn(),
      };
    },
  };

  api.files.get = vi.fn();
  api.files.post = vi.fn();
  api.files["soft-delete"] = vi.fn();

  return { api };

  // return {
  //   api: {
  //     ...api,
  //     user: {
  //       get: vi.fn((...args) => api.user.get(...args)),
  //     },
  //     "user-auth": {
  //       ...api["user-auth"],
  //       "sign-in": {
  //         post: vi.fn((...args) => (api["user-auth"]["sign-in"].post as any)(...args)),
  //         "verify-srp": {
  //           post: vi.fn((...args) =>
  //             (api["user-auth"]["sign-in"]["verify-srp"].post as any)(...args),
  //           ),
  //         },
  //       },
  //       "sign-up": {
  //         put: vi.fn((...args) => (api["user-auth"]["sign-up"].put as any)(...args)),
  //       },
  //       "verify-ott": {
  //         post: vi.fn((...args) => (api["user-auth"]["verify-ott"].post as any)(...args)),
  //       },
  //       "finish-sign-up": {
  //         put: vi.fn((...args) => (api["user-auth"]["finish-sign-up"].put as any)(...args)),
  //       },
  //     },
  //     files: {
  //       get: vi.fn((...args) => (api.files.get as any)(...args)),
  //       post: vi.fn((...args) => (api.files.post as any)(...args)),
  //     },
  //   },
  // };
});
