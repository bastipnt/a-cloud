import { config } from "@acloud/server/config";
import { resetDB } from "@acloud/server/src/db"; // TODO: maybe also in testing package
import { createSignedUpTestUser } from "@acloud/server/src/db/seed"; // TODO: maybe also in testing package
import { testUsers } from "@acloud/testing";
import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, expect, test } from "bun:test";
import App from "./App";

const ben = testUsers.ben;

// TODO: tests failing when running in parallel because of db resetting

beforeAll(async () => {
  await createSignedUpTestUser("ben");
  cookieJar.setCookie(`auth=${ben.jwt}`, config.endpoint.api);
});

afterAll(async () => {
  await resetDB();
});

test("loads and has main element", async () => {
  render(<App />);

  expect(screen.getByRole<HTMLElement>("main"));
});
