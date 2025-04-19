import type { App } from "@acloud/server";
import { treaty } from "@elysiajs/eden";

export const api = treaty<App>("localhost:3000", {
  fetch: { credentials: "include" },
});
