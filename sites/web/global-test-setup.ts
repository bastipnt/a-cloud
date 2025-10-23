import { migrateDB, resetDB } from "@acloud/db";
import { cleanup } from "@testing-library/react";

let teardownHappened = false;

export default async function () {
  await migrateDB();
  await resetDB();

  return async () => {
    if (teardownHappened) {
      throw new Error("teardown called twice");
    }
    teardownHappened = true;
    cleanup();
  };
}
