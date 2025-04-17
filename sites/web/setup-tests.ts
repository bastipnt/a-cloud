import { migrateDB, resetDB } from "@acloud/db";
import { registerCookieJar } from "@acloud/testing";
import { cleanup } from "@testing-library/react";
import { beforeAll, beforeEach, Mock, mock } from "bun:test";
import { useLocation } from "wouter";

registerCookieJar();
beforeAll(async () => {
  mock.module("wouter", () => {
    const navigate = mock((_location: string) => {});

    return {
      useLocation: () => [undefined, navigate],
    };
  });

  await migrateDB();
  await resetDB();
});

beforeEach(async () => {
  await cookieJar.removeAllCookies();
  cleanup();
  (useLocation()[1] as Mock<ReturnType<typeof useLocation>[1]>).mockClear();
});
