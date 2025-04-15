import { config } from "@acloud/config";
import { createSignedUpTestUser, resetDB } from "@acloud/db";
import { testUsers } from "@acloud/testing";
import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import App from "./App";

describe("App.tsx", () => {
  const ben = testUsers.ben;

  beforeAll(async () => {
    await createSignedUpTestUser("ben");
  });

  beforeEach(async () => {
    await cookieJar.setCookie(`auth=${ben.jwt}`, config.endpoint.api);
  });

  afterAll(async () => {
    await resetDB();
  });

  test("loads and has main element", async () => {
    render(<App />);

    expect(screen.getByRole<HTMLElement>("main"));
  });
});
