import { testUsers } from "@acloud/testing";
import { treaty } from "@elysiajs/eden";
import { describe, expect, it } from "bun:test";
import { userRoutes } from "./user";

const api = treaty(userRoutes);

const ty = testUsers.ty;

describe("user routes", () => {
  describe("[GET] /", () => {
    describe("signed in", () => {
      it("returns an existing userId", async () => {
        const { data } = await api.user.index.get({
          headers: {
            Cookie: ty.jwt,
          },
        });

        expect(data).toEqual({
          message: "Get user",
          userId: ty.userId,
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
