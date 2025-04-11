import { mock } from "bun:test";
import { db } from ".";

mock.module(".", () => {
  return {
    migrateDB: mock(),
    db,
  };
});
