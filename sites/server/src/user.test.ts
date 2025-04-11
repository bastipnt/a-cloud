import { treaty } from "@elysiajs/eden";
import { describe, expect, it } from "bun:test";
import { validJWT, validUserId } from "../test/test-data";
import { userRoutes } from "./user";

const api = treaty(userRoutes);

describe("user routes", () => {
  describe("GET /", () => {
    describe("signed in", () => {
      it("returns an existing userId", async () => {
        const { data } = await api.user.index.get({
          headers: {
            Cookie: validJWT,
          },
        });

        expect(data).toEqual({
          message: "Get user",
          userId: validUserId,
        });
      });
    });

    describe("signed out", () => {
      it("returns 401", async () => {
        const res = await api.user.index.get();

        expect(res.status).toBe(401);
      });
    });

    describe("invalid JWT", () => {
      it("returns 401", async () => {
        const res = await api.user.index.get({
          headers: {
            Cookie: "invalid",
          },
        });

        expect(res.status).toBe(401);
      });
    });
  });
});
