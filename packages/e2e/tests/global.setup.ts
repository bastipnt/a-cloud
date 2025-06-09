import { createSignedUpTestUser, migrateDB, resetDB } from "@acloud/db";
import { test as setup } from "@playwright/test";

setup("create new database", async () => {
  console.log("creating new database...");
  await migrateDB();
  await resetDB();

  await createSignedUpTestUser("ben");
});
