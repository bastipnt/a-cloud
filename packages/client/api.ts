import { config } from "@acloud/config";
import type { App } from "@acloud/server";
import { treaty } from "@elysiajs/eden";

export const api = treaty<App>(config.endpoint.api, {
  fetch: { credentials: "include" },
});
