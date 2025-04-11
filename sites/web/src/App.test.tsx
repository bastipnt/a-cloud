import { render, screen } from "@testing-library/react";
import { expect, test } from "bun:test";
import App from "./App";

test("loads and has main element", async () => {
  render(<App />);

  expect(screen.getByRole<HTMLElement>("main"));
});
