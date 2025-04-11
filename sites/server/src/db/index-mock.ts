import { mock } from "bun:test";

mock.module(".", () => {
  return {
    migrateDB: mock(),
    db: {},
  };
});
