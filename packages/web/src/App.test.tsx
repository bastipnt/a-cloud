// import { expect, test } from "vitest";
// import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { expect, test } from "bun:test";
import App from "./App";

test("loads and displays greeting", async () => {
  render(<App />);

  await screen.findByRole("heading");

  // ASSERT
  expect(screen.getByRole<HTMLHeadingElement>("heading").textContent).toContain("Hello");
  // expect(screen.getByRole<HTMLButtonElement>("button")).toBeDisabled();
});
