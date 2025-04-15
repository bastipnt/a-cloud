import { config } from "@acloud/config";
import {
  deriveSrpClientSession,
  encryptBoxWithNonceBase64,
  getHashBase64,
  verifySrpSession,
} from "@acloud/crypto";
import { fromBase64 } from "@acloud/crypto/src/util/conversion-helper";
import {
  db,
  eq,
  findOttByUserId,
  findUserByEmail,
  migrateDB,
  ottsTable,
  OTTType,
  resetDB,
  usersTable,
  UserType,
} from "@acloud/db";
import { testUsers } from "@acloud/testing";
import { Treaty, treaty } from "@elysiajs/eden";
import { jwt } from "@elysiajs/jwt";
import { afterAll, beforeAll, describe, expect, it, setSystemTime } from "bun:test";
import { srpServer } from "./srpServer";
import { userAuthRoutes } from "./userAuth";

const api = treaty(userAuthRoutes);
const date = new Date("2020-01-01T00:00:00.000Z");

beforeAll(async () => {
  await migrateDB();
  setSystemTime(date);
});

afterAll(async () => {
  await resetDB();
});

describe("user auth routes", () => {
  describe("sign-up", () => {
    describe("[PUT] /sign-up", () => {
      describe("valid new user", () => {
        const email = "sign-up-valid@example.com";
        let res: Treaty.TreatyResponse<{
          200: AResponse;
        }>;
        let user: UserType;

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
          const emailHash = await getHashBase64(email, config.serverKeys.hashingKey);
          const encryptedEmail = await encryptBoxWithNonceBase64(
            btoa(email),
            config.serverKeys.encryptionKey,
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
        let user: UserType;
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
        let user: UserType;
        let ott: OTTType;
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
            expect((headers as Headers).get("set-cookie")).toContain("tmpSignUpAuth=");

            const cookie = (headers as Headers).get("set-cookie")!;

            const jwtToken = cookie.match(
              /^tmpSignUpAuth=(.*); Max-Age=1800; Path=\/; HttpOnly$/,
            )![1];

            const jwtValues = (await jwt({ secret: config.jwt.secret }).decorator.jwt.verify(
              jwtToken,
            )) as {
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
            const res = await api["user-auth"]["verify-ott"].post({
              email: "invalid",
              ott: ott.ott,
            });
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
      describe("with valid jwt token and params", () => {
        const lara = testUsers.lara;
        const { email } = lara;
        let user: UserType;
        let cookie: string;

        beforeAll(async () => {
          await api["user-auth"]["sign-up"].put({ email });
          user = (await findUserByEmail(email))!;
          const ott = (await findOttByUserId(user.userId))!.ott;
          const res = await api["user-auth"]["verify-ott"].post({ email, ott });
          cookie = (res.headers as Headers).get("set-cookie")!;
        });

        it("stores the srp and key params and removes the tmp cookie", async () => {
          const res = await api["user-auth"]["finish-sign-up"].put(lara.signUpParams, {
            headers: { Cookie: cookie },
          });

          expect(res.status).toBe(200);

          const keys = (await db.query.keysTable.findFirst({
            where: (k, { eq }) => eq(k.userId, user.userId),
          }))!;

          expect(keys).toMatchObject({ ...lara.signUpParams.keyParams, userId: user.userId });

          const srpValues = (await db.query.srpsTable.findFirst({
            where: (s, { eq }) => eq(s.userId, user.userId),
          }))!;

          expect(srpValues).toMatchObject({
            ...lara.signUpParams.srpParams,
            userId: user.userId,
          });

          // removes cookie
          expect((res.headers as Headers).get("set-cookie")).toEqual(
            "tmpSignUpAuth=; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
          );
        });
      });

      describe("with not existing user", () => {
        const ben = testUsers.ben;
        const { email } = ben;
        let user: UserType;
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
          const res = await api["user-auth"]["finish-sign-up"].put(ben.signUpParams, {
            headers: { Cookie: cookie },
          });

          expect(res.status).toBe(401);

          // removes cookie
          expect((res.headers as Headers).get("set-cookie")).toEqual(
            "tmpSignUpAuth=; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
          );
        });
      });

      describe("invalid cookie", () => {
        const jo = testUsers.jo;
        const { email } = jo;
        let user: UserType;

        beforeAll(async () => {
          await api["user-auth"]["sign-up"].put({ email });
          user = (await findUserByEmail(email))!;
          const ott = (await findOttByUserId(user.userId))!.ott;
          await api["user-auth"]["verify-ott"].post({ email, ott });
        });

        describe("cookie not set", () => {
          it("returns 401", async () => {
            const res = await api["user-auth"]["finish-sign-up"].put(jo.signUpParams);

            expect(res.status).toBe(401);
          });
        });

        describe("cookie invalid", () => {
          it("returns 401", async () => {
            const res = await api["user-auth"]["finish-sign-up"].put(jo.signUpParams, {
              headers: { Cookie: "invalid" },
            });

            expect(res.status).toBe(401);
            expect(res.error?.value).toBe("Unauthorized");
          });
        });
      });

      describe("unverified email", () => {
        const julia = testUsers.julia;
        const { email } = julia;
        let user: UserType;
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
          const res = await api["user-auth"]["finish-sign-up"].put(julia.signUpParams, {
            headers: { Cookie: cookie },
          });

          expect(res.status).toBe(401);
          expect(res.error?.value).toBe("Not Verified");
        });
      });
    });
  });

  describe("sign-in", () => {
    let user: UserType;
    const peter = testUsers.peter;
    const { email } = peter;

    beforeAll(async () => {
      await api["user-auth"]["sign-up"].put({ email });
      user = (await findUserByEmail(email))!;
      const ott = (await findOttByUserId(user.userId))!.ott;
      const res = await api["user-auth"]["verify-ott"].post({ email, ott });
      const tmpCookie = (res.headers as Headers).get("set-cookie")!;
      await api["user-auth"]["finish-sign-up"].put(peter.signUpParams, {
        headers: { Cookie: tmpCookie },
      });
    });

    describe("[POST] /sign-in", () => {
      describe("signed up user with valid credentials", () => {
        it("returns srp attributes and a temporary session", async () => {
          const { srpClientEphemeralPublic } = peter.srpClientEphemeral;
          const res = await api["user-auth"]["sign-in"].post({ email, srpClientEphemeralPublic });

          expect(res.status).toBe(200);
          expect(res.data?.srpSalt).toBe(peter.signUpParams.srpParams.srpSalt);
          expect(res.data?.srpServerEphemeralPublic).toBeString();

          const cookie = (res.headers as Headers).get("set-cookie")!;

          const jwtToken = cookie.match(
            /^tmpSignInAuth=(.*); Max-Age=1800; Path=\/; HttpOnly$/,
          )![1];

          const jwtValues = (await jwt({ secret: config.jwt.secret }).decorator.jwt.verify(
            jwtToken,
          )) as {
            userId: string;
            srpClientEphemeralPublic: string;
            exp: number;
          };

          expect(jwtValues).toMatchObject({
            userId: user.userId,
            srpClientEphemeralPublic,
          });

          const userSrp = userAuthRoutes.store.srp.find(({ userId }) => userId === user.userId);

          expect(userSrp).toMatchObject({
            userId: user.userId,
            srpSalt: peter.signUpParams.srpParams.srpSalt,
            srpVerifier: peter.signUpParams.srpParams.srpVerifier,
          });

          expect(userSrp?.srpServerEphemeralSecret).toBeString();
        });

        describe("with auth cookie", () => {
          it("returns already signed in if user is already signed in", async () => {
            const { srpClientEphemeralPublic } = peter.srpClientEphemeral;
            const res = await api["user-auth"]["sign-in"].post(
              { email, srpClientEphemeralPublic },
              { headers: { Cookie: `auth=${peter.jwt}` } },
            );

            expect(res.status).toBe(200);
            expect(res.data?.message).toBe("already signed in");
          });

          it("removes the auth cookie if it is invalid", async () => {
            const { srpClientEphemeralPublic } = peter.srpClientEphemeral;
            const res = await api["user-auth"]["sign-in"].post(
              { email, srpClientEphemeralPublic },
              { headers: { Cookie: "auth=invalid" } },
            );

            expect(res.status).toBe(200);
            expect(res.data?.message).toBeUndefined();
            expect(res.data?.srpSalt).toBe(peter.signUpParams.srpParams.srpSalt);
            expect(res.data?.srpServerEphemeralPublic).toBeString();

            // Removes invalid auth cookie
            expect((res.headers as Headers).getAll("set-cookie")).toContain(
              "auth=; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
            );
          });
        });
      });

      describe("wrong email", () => {
        // if no user cannot be found in the database, a bogus salt and ephemeral value should be returned, to avoid leaking which users have signed up.
        it("returns 200 with bogus salt and ephemeral", async () => {
          const { srpClientEphemeralPublic } = peter.srpClientEphemeral;
          const res = await api["user-auth"]["sign-in"].post({
            email: "wrong@example.com",
            srpClientEphemeralPublic,
          });

          expect(res.status).toBe(200);

          expect(res.data?.srpSalt).toBeString();
          expect(res.data?.srpServerEphemeralPublic).toBeString();

          const cookie = (res.headers as Headers).get("set-cookie")!;
          expect(cookie).toStartWith("tmpSignInAuth=");
        });

        it("returns validation error for invalid email", async () => {
          const { srpClientEphemeralPublic } = peter.srpClientEphemeral;
          const res = await api["user-auth"]["sign-in"].post({
            email: "invalid",
            srpClientEphemeralPublic,
          });

          expect(res.status).toBe(422);
          expect(res.error?.value.summary).toBe("Property 'email' should be email");
        });
      });
    });

    describe("[POST] /sign-in/verify-srp", () => {
      let tmpSignInAuthCookie: string;
      let srpClientSession: {
        srpClientSessionProof: string;
        srpClientSessionKey: string;
      };
      let srpServerEphemeralPublic: string;

      beforeAll(async () => {
        const { srpClientEphemeralPublic, srpClientEphemeralSecret } = peter.srpClientEphemeral;
        const res = await api["user-auth"]["sign-in"].post({ email, srpClientEphemeralPublic });
        tmpSignInAuthCookie = (res.headers as Headers).get("set-cookie")!;
        srpServerEphemeralPublic = res.data!.srpServerEphemeralPublic!;

        srpClientSession = await deriveSrpClientSession(
          peter.password,
          peter.signUpParams.srpParams.srpSalt,
          srpClientEphemeralSecret,
          srpServerEphemeralPublic,
        );
      });

      describe("signed up user with valid credentials", () => {
        it("returns a valid session token", async () => {
          const res = await api["user-auth"]["sign-in"]["verify-srp"].post(
            { srpClientSessionProof: srpClientSession.srpClientSessionProof },
            { headers: { cookie: tmpSignInAuthCookie } },
          );

          expect(res.status).toBe(200);

          const cookies = (res.headers as Headers).getAll("set-cookie");
          // removes tmp cookie
          expect(cookies).toContain(
            "tmpSignInAuth=; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
          );

          const sessionCookie = cookies[1]!;
          const sessionJwt = sessionCookie.match(
            /^auth=(.*); Max-Age=604800; Path=\/; HttpOnly$/,
          )![1];

          const jwtValues = (await jwt({ secret: config.jwt.secret }).decorator.jwt.verify(
            sessionJwt,
          )) as {
            userId: string;
            exp: number;
          };

          expect(jwtValues).toMatchObject({
            userId: user.userId,
          });

          const { srpServerSessionProof } = res.data!;

          expect(() =>
            verifySrpSession(
              peter.srpClientEphemeral.srpClientEphemeralPublic,
              srpClientSession.srpClientSessionProof,
              srpClientSession.srpClientSessionKey,
              srpServerSessionProof!,
            ),
          ).not.toThrowError();
        });
      });

      describe("signed up user with invalid password", () => {
        let invalidSrpClientSession: {
          srpClientSessionProof: string;
          srpClientSessionKey: string;
        };

        beforeAll(async () => {
          const { srpClientEphemeralSecret } = peter.srpClientEphemeral;

          invalidSrpClientSession = await deriveSrpClientSession(
            peter.password,
            peter.signUpParams.srpParams.srpSalt,
            srpClientEphemeralSecret,
            srpServerEphemeralPublic,
          );
        });

        it("returns 401", async () => {
          const srpServerEphemeral = await srpServer.generateEphemeral(
            peter.signUpParams.srpParams.srpVerifier,
          );

          userAuthRoutes.store.srp.push({
            userId: user.userId,
            srpServerEphemeralSecret: srpServerEphemeral.secret,
            srpSalt: peter.signUpParams.srpParams.srpSalt,
            srpVerifier: peter.signUpParams.srpParams.srpVerifier,
          });

          const res = await api["user-auth"]["sign-in"]["verify-srp"].post(
            { srpClientSessionProof: invalidSrpClientSession.srpClientSessionProof },
            { headers: { Cookie: tmpSignInAuthCookie } },
          );

          expect(res.status).toBe(401);
        });
      });

      describe("already signed in user", () => {
        it("returns already signed in", async () => {
          const res = await api["user-auth"]["sign-in"]["verify-srp"].post(
            { srpClientSessionProof: srpClientSession.srpClientSessionProof },
            { headers: { Cookie: `auth=${peter.jwt}` } },
          );

          expect(res.status).toBe(200);
          expect(res.data?.message).toBe("already signed in");
        });
      });
    });
  });
});
