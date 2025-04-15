import { migrateDB, resetDB } from "@acloud/db";
import { registerCookieJar } from "@acloud/testing";
import { beforeAll, beforeEach } from "bun:test";

registerCookieJar();

beforeAll(async () => {
  await migrateDB();
  await resetDB();
});

beforeEach(async () => {
  await cookieJar.removeAllCookies();
});
