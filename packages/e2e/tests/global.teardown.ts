import { resetDB } from "@acloud/db";
import { test as teardown } from "@playwright/test";

teardown("delete database", async () => {
  console.log("deleting test database...");
  await resetDB();
});
