import { encryptBoxWithNonceBase64, getHashBase64 } from "@acloud/crypto";
import { fromBase64 } from "@acloud/crypto/src/util/conversion-helper";
import { Treaty, treaty } from "@elysiajs/eden";
import { jwt } from "@elysiajs/jwt";
import { afterAll, beforeAll, describe, expect, it, setSystemTime } from "bun:test";
import { eq, InferSelectModel } from "drizzle-orm";
import { jwtSecret, serverKeys } from "../config";
import { db, findOttByUserId, findUserByEmail, migrateDB, resetDB } from "./db";
import { ottsTable } from "./db/schema/otts";
import { usersTable } from "./db/schema/users";
import { KeyParams, SrpParams, userAuthRoutes } from "./userAuth";

const api = treaty(userAuthRoutes);
const date = new Date("2020-01-01T00:00:00.000Z");
const jwtRegex = /^tmpOTTAuth=(.*); Max-Age=1800; Path=\/; HttpOnly$/;

beforeAll(async () => {
  await migrateDB();
  setSystemTime(date);
});

afterAll(async () => {
  await resetDB();
});

describe("user auth routes", () => {
  describe("[PUT] /sign-up", () => {
    describe("valid new user", () => {
      const email = "test1-user@example.com";
      let res: Treaty.TreatyResponse<{
        200: AResponse;
      }>;
      let user: InferSelectModel<typeof usersTable>;

      beforeAll(async () => {
        res = await api["user-auth"]["sign-up"].put({ email });
        user = (await findUserByEmail(email))!;
      });

      it("returns a success message", async () => {
        expect(res.status).toBe(200);
        expect(res.data).toEqual({
          message: "signedUp",
        });
      });

      it("stores the new created user in the db", async () => {
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
        expect(user.createdAt).toEqual(date);
      });

      it("creates a one time token (OTT)", async () => {
        const ott = (await findOttByUserId(user.userId))!;

        expect(Number(ott.ott)).toBeNumber();

        const { userId } = (await db.query.usersTable.findFirst({ columns: { userId: true } }))!;
        expect(ott.userId).toBe(userId);
        expect(ott.createdAt).toEqual(date);

        // token is valid for one hour
        const futureDate = new Date(date);
        futureDate.setHours(1);
        expect(ott.expiresAt).toEqual(futureDate);
      });
    });

    describe("already existing unverified user", () => {
      const email = "sign-up-unverified-user@example.com";

      beforeAll(async () => {
        await api["user-auth"]["sign-up"].put({ email });
      });

      it("does not create a new user and updates the ott", async () => {
        const existingUser = (await findUserByEmail(email))!;
        expect(existingUser).toBeObject();

        const existingOTT = (await findOttByUserId(existingUser.userId))!;

        const res = await api["user-auth"]["sign-up"].put({ email });
        expect(res.status).toBe(200);
        expect(res.data?.message).toBe("signedUp");

        const user = (await findUserByEmail(email))!;

        const ott = (await findOttByUserId(user.userId))!;
        expect(existingUser.userId).toBe(user.userId);
        expect(existingOTT.userId).toBe(ott.userId);
        expect(existingOTT.ott).not.toBe(ott.ott);

        const userOTTs = await db.query.ottsTable.findMany({
          where: (o, { eq }) => eq(o.userId, user.userId),
        });

        expect(userOTTs.length).toBe(1);
      });
    });

    describe("already existing verified user", () => {
      let user: InferSelectModel<typeof usersTable>;
      const email = "test3-user@example.com";

      beforeAll(async () => {
        await api["user-auth"]["sign-up"].put({ email });
        user = (await findUserByEmail(email))!;
        await db
          .update(usersTable)
          .set({ hasEmailVerified: true })
          .where(eq(usersTable.userId, user.userId));

        await db.delete(ottsTable).where(eq(ottsTable.userId, user.userId));
      });

      it("returns user already verified status and does not create a new ott", async () => {
        const res = await api["user-auth"]["sign-up"].put({ email });
        expect(res.status).toBe(200);
        expect(res.data?.message).toBe("alreadyVerified");

        const ott = await findOttByUserId(user.userId);
        expect(ott).toBeUndefined();
      });
    });

    describe("invalid email", () => {
      const email = "invalid";

      it("returns an validation error", async () => {
        const res = await api["user-auth"]["sign-up"].put({ email });

        expect(res.status).toBe(422);
        expect(res.error?.value.type).toBe("validation");
        expect(res.error?.value.summary).toBe("Property 'email' should be email");
      });
    });
  });

  describe("[POST] /verify-ott", () => {
    describe("existing unverified user", () => {
      let user: InferSelectModel<typeof usersTable>;
      let ott: InferSelectModel<typeof ottsTable>;
      const email = "test-put-verify-ott@example.com";
      const email2 = "test-put-verify-ott-2@example.com";
      let res: Treaty.TreatyResponse<{
        200: AResponse;
      }>;

      beforeAll(async () => {
        await api["user-auth"]["sign-up"].put({ email });
        await api["user-auth"]["sign-up"].put({ email: email2 });

        user = (await findUserByEmail(email))!;
        ott = (await findOttByUserId(user.userId))!;

        res = await api["user-auth"]["verify-ott"].post({ email, ott: ott.ott });
      });

      describe("valid ott", () => {
        it("verifies the users email and sets a tmp jwt token", async () => {
          const { status, data, headers } = res;

          expect(status).toBe(200);
          expect(data?.message).toBe("verified");
          expect((headers as Headers).get("set-cookie")).toContain("tmpOTTAuth=");

          const cookie = (headers as Headers).get("set-cookie")!;

          const jwtToken = cookie.match(jwtRegex)![1];

          const jwtValues = (await jwt({ secret: jwtSecret }).decorator.jwt.verify(jwtToken)) as {
            userId: string;
            ott: string;
            exp: number;
          };

          expect(jwtValues.userId).toBe(user.userId);
          expect(jwtValues.ott).toBe(ott.ott);

          expect(await findOttByUserId(user.userId)).toBeUndefined();
        });

        it("does not verify other users", async () => {
          const user2 = (await findUserByEmail(email2))!;
          expect(user2.hasEmailVerified).toBeFalse();
        });
      });

      describe("invalid ott", () => {
        it("returns 401, for invalid format", async () => {
          const res = await api["user-auth"]["verify-ott"].post({ email, ott: "invalid" });
          expect(res.status).toBe(401);
        });
      });

      describe("invalid email", () => {
        it("returns 422, for wrong email format", async () => {
          const res = await api["user-auth"]["verify-ott"].post({ email: "invalid", ott: ott.ott });
          expect(res.status).toBe(422);
        });

        it("returns 401, for wrong email", async () => {
          const res = await api["user-auth"]["verify-ott"].post({
            email: "invalid@example.com",
            ott: ott.ott,
          });
          expect(res.status).toBe(401);
          expect(res.error?.value).toBe("Unauthorized");
        });
      });
    });
  });

  describe("[PUT] /finish-sign-up", () => {
    const srpParams: SrpParams = { srpSalt: "salt", srpVerifier: "verifier" };

    const keyParams: KeyParams = {
      encryptedMainKey: "mainKey",
      encryptedMainKeyWithRecoveryKey: "mainWithRecovery",
      encryptedPrivateKey: "privateKey",
      encryptedRecoveryKey: "recoveryKey",
      keyEncryptionKeySalt: "keyEncryptionKeySalt",
      mainKeyNonce: "mainKeyNonce",
      mainKeyWithRecoveryKeyNonce: "mainRecoverNonce",
      memLimit: 12,
      opsLimit: 16,
      privateKeyNonce: "privateNonce",
      publicKey: "publicKey",
      recoveryKeyNonce: "recoveryNonce",
    };

    describe("with valid jwt token and params", () => {
      const email = "finish-sign-up-valid@example.com";
      let user: InferSelectModel<typeof usersTable>;
      let cookie: string;

      beforeAll(async () => {
        await api["user-auth"]["sign-up"].put({ email });
        user = (await findUserByEmail(email))!;
        const ott = (await findOttByUserId(user.userId))!.ott;
        const res = await api["user-auth"]["verify-ott"].post({ email, ott });
        cookie = (res.headers as Headers).get("set-cookie")!;
      });

      it("stores the srp and key params and removes the tmp cookie", async () => {
        const res = await api["user-auth"]["finish-sign-up"].put(
          { srpParams, keyParams },
          { headers: { Cookie: cookie } },
        );

        expect(res.status).toBe(200);

        const keys = (await db.query.keysTable.findFirst({
          where: (k, { eq }) => eq(k.userId, user.userId),
        }))!;

        expect(keys).toMatchObject({ ...keyParams, userId: user.userId });

        const srpValues = (await db.query.srpsTable.findFirst({
          where: (s, { eq }) => eq(s.userId, user.userId),
        }))!;

        expect(srpValues).toMatchObject({ ...srpParams, userId: user.userId });

        // removes cookie
        expect((res.headers as Headers).get("set-cookie")).toEqual(
          "tmpOTTAuth=; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
        );
      });
    });

    describe("with not existing user", () => {
      const email = "finish-sign-up-valid-not-existing-user@example.com";
      let user: InferSelectModel<typeof usersTable>;
      let cookie: string;

      beforeAll(async () => {
        await api["user-auth"]["sign-up"].put({ email });
        user = (await findUserByEmail(email))!;
        const ott = (await findOttByUserId(user.userId))!.ott;
        const res = await api["user-auth"]["verify-ott"].post({ email, ott });
        cookie = (res.headers as Headers).get("set-cookie")!;

        await db.delete(usersTable).where(eq(usersTable.userId, user.userId));
      });

      it("returns 401", async () => {
        const res = await api["user-auth"]["finish-sign-up"].put(
          { srpParams, keyParams },
          { headers: { Cookie: cookie } },
        );

        expect(res.status).toBe(401);

        // removes cookie
        expect((res.headers as Headers).get("set-cookie")).toEqual(
          "tmpOTTAuth=; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
        );
      });
    });

    describe("invalid cookie", () => {
      const email = "finish-sign-up-invalid-cookie@example.com";
      let user: InferSelectModel<typeof usersTable>;

      beforeAll(async () => {
        await api["user-auth"]["sign-up"].put({ email });
        user = (await findUserByEmail(email))!;
        const ott = (await findOttByUserId(user.userId))!.ott;
        await api["user-auth"]["verify-ott"].post({ email, ott });
      });

      describe("cookie not set", () => {
        it("returns 401", async () => {
          const res = await api["user-auth"]["finish-sign-up"].put({ srpParams, keyParams });

          expect(res.status).toBe(401);
        });
      });

      describe("cookie invalid", () => {
        it("returns 401", async () => {
          const res = await api["user-auth"]["finish-sign-up"].put(
            { srpParams, keyParams },
            { headers: { Cookie: "invalid" } },
          );

          expect(res.status).toBe(401);
          expect(res.error?.value).toBe("Unauthorized");
        });
      });
    });

    describe("unverified email", () => {
      const email = "finish-sign-up-unverified@example.com";
      let user: InferSelectModel<typeof usersTable>;
      let cookie: string;

      beforeAll(async () => {
        await api["user-auth"]["sign-up"].put({ email });
        user = (await findUserByEmail(email))!;
        const ott = (await findOttByUserId(user.userId))!.ott;
        const res = await api["user-auth"]["verify-ott"].post({ email, ott });
        cookie = (res.headers as Headers).get("set-cookie")!;
        await db
          .update(usersTable)
          .set({ hasEmailVerified: false })
          .where(eq(usersTable.userId, user.userId));
      });

      it("returns 401", async () => {
        const res = await api["user-auth"]["finish-sign-up"].put(
          { srpParams, keyParams },
          { headers: { Cookie: cookie } },
        );

        expect(res.status).toBe(401);
        expect(res.error?.value).toBe("Not Verified");
      });
    });
  });
});
