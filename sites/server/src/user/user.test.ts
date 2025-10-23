import { testUsers } from "@acloud/testing";
import { treaty } from "@elysiajs/eden";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { userRoutes } from ".";
import { createSignedUpTestUser, resetDB } from "@acloud/db";

const api = treaty(userRoutes);

const ty = testUsers.ty;

describe("user routes", () => {
  afterAll(async () => {
    await resetDB();
  });

  describe("[GET] /", () => {
    describe("signed in", () => {
      beforeAll(async () => {
        await createSignedUpTestUser("ty");
      });

      it("returns an existing userId", async () => {
        const { data } = await api.user.get({
          headers: {
            Cookie: `auth=${ty.jwt}`,
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
        const res = await api.user.get();

        expect(res.status).toBe(401);
      });
    });

    describe("invalid JWT", () => {
      it("returns 401", async () => {
        const res = await api.user.get({
          headers: {
            Cookie: "invalid",
          },
        });

        expect(res.status).toBe(401);
      });
    });
  });
});
