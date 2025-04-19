import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "bun:test";
import { useLocation } from "wouter";
import Index from "./Index";

describe("Index", () => {
  describe("not signed in", () => {
    beforeEach(() => {
      render(<Index />);
    });

    it("redirects to /sign-in", async () => {
      expect(useLocation()[1]).toHaveBeenCalledWith("/sign-in");
    });
  });
});
