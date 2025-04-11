import { encryptBoxWithNonceBase64, getHashBase64 } from "@acloud/crypto";
import { fromBase64 } from "@acloud/crypto/src/util/conversion-helper";
import { Treaty, treaty } from "@elysiajs/eden";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { serverKeys } from "../config";
import { db, migrateDB, resetDB } from "./db";
import { userAuthRoutes } from "./userAuth";

const api = treaty(userAuthRoutes);

beforeAll(async () => {
  await migrateDB();
});

afterAll(async () => {
  await resetDB();
});

describe("user auth routes", () => {
  describe("[PUT] /sign-up", () => {
    describe("new user with new email", () => {
      const email = "test-user@example.com";
      let res: Treaty.TreatyResponse<{
        200: AResponse;
      }>;

      beforeAll(async () => {
        res = await api["user-auth"]["sign-up"].put({ email });
      });

      it("returns a success message", async () => {
        expect(res.status).toBe(200);
        expect(res.data).toEqual({
          message: "signed up",
        });
      });

      it("stores the new created user in the db", async () => {
        const users = await db.query.usersTable.findMany();
        expect(users.length).toBe(1);

        const user = users[0]!;

        const emailHash = await getHashBase64(email, serverKeys.hashingKey);
        const encryptedEmail = await encryptBoxWithNonceBase64(
          btoa(email),
          serverKeys.encryptionKey,
          await fromBase64(user.emailNonce),
        );

        expect(user.userId).toBeString();
        expect(user.emailHash).toBe(emailHash);
        expect(user.encryptedEmail).toBe(encryptedEmail);
        expect(user.hasEmailVerified).toBe(false);
        expect(user.hasTwoFactorEnabled).toBe(false);
      });

      // TODO: test expiration date
      it("creates a one time token (OTT)", async () => {
        const otts = await db.query.ottsTable.findMany();
        expect(otts.length).toBe(1);

        const ott = otts[0]!;
        expect(Number(ott.ott)).toBeNumber();

        const { userId } = (await db.query.usersTable.findFirst({ columns: { userId: true } }))!;
        expect(ott.userId).toBe(userId);
      });
    });
  });
});
