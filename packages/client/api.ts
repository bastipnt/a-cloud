import type { App } from "@acloud/server";
import { config } from "@acloud/server/config";
import { treaty } from "@elysiajs/eden";

export const api = treaty<App>(config.endpoint.api, {
  fetch: { credentials: "include" },
});
