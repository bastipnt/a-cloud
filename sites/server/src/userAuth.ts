import { config } from "@acloud/config";
import { encryptBoxBase64, genOTT, genSrpAttributes, getHashBase64 } from "@acloud/crypto";
import {
  db,
  eq,
  findUserByEmail,
  findUserByUserId,
  keysTable,
  ottsTable,
  srpsTable,
  usersTable,
  UserType,
} from "@acloud/db";
import Elysia, { t } from "elysia";
import { authPlugin } from "./plugins/authPlugin";
import { srpServer } from "./srpServer";

const srpState: {
  userId: string;
  srpServerEphemeralSecret: string;
  srpSalt: string;
  srpVerifier: string;
}[] = [];

export type SrpParams = {
  srpSalt: string;
  srpVerifier: string;
};

export type KeyParams = {
  keyEncryptionKeySalt: Base64URLString;

  encryptedMainKey: Base64URLString;
  mainKeyNonce: Base64URLString;

  encryptedMainKeyWithRecoveryKey: Base64URLString;
  mainKeyWithRecoveryKeyNonce: Base64URLString;

  encryptedRecoveryKey: Base64URLString;
  recoveryKeyNonce: Base64URLString;

  encryptedPrivateKey: Base64URLString;
  privateKeyNonce: Base64URLString;
  publicKey: string;

  memLimit: number;
  opsLimit: number;
};

type FinishSignUpParams = {
  srpParams: SrpParams;

  keyParams: KeyParams;
};

const signUpUserParams = t.Object({
  email: t.String({ format: "email" }),
});

const verifyOTTParams = t.Object({
  email: t.String({ format: "email" }),
  ott: t.String(),
});

const signInParams = t.Object({
  email: t.String({ format: "email" }),
  srpClientEphemeralPublic: t.String(),
});

const signInVerifySrpParams = t.Object({
  srpClientSessionProof: t.String(),
});

const finishSignUpParams = t.Object({
  srpParams: t.Object({
    srpSalt: t.String(),
    srpVerifier: t.String(),
  }),

  keyParams: t.Object({
    keyEncryptionKeySalt: t.String(),

    encryptedMainKey: t.String(),
    mainKeyNonce: t.String(),

    encryptedMainKeyWithRecoveryKey: t.String(),
    mainKeyWithRecoveryKeyNonce: t.String(),

    encryptedRecoveryKey: t.String(),
    recoveryKeyNonce: t.String(),

    encryptedPrivateKey: t.String(),
    privateKeyNonce: t.String(),
    publicKey: t.String(),

    memLimit: t.Number(),
    opsLimit: t.Number(),
  }),
});

const cookies = t.Cookie({
  auth: t.Optional(t.String()),
  tmpSignInAuth: t.Optional(t.String()),
  tmpSignUpAuth: t.Optional(t.String()),
});

class UserNotFoundError extends Error {
  override name = "UserNotFoundError";
}

class UserEmailNotVerifiedError extends Error {
  override name = "UserEmailNotVerifiedError";
}

class UserAuthController {
  async signUp(signUpParams: {
    email: string;
  }): Promise<"created" | "updated" | "alreadyVerified"> {
    const { email } = signUpParams;

    const [encryptedEmail, emailNonce] = await encryptBoxBase64(
      btoa(email),
      config.serverKeys.encryptionKey,
    );

    const emailHash = await getHashBase64(email, config.serverKeys.hashingKey);

    const newUser = {
      encryptedEmail,
      emailNonce,
      emailHash,
    };

    const userRes = await db
      .insert(usersTable)
      .values(newUser)
      .onConflictDoNothing({ target: usersTable.emailHash })
      .returning({ userId: usersTable.userId });

    let user: UserType | undefined;

    // already existing
    if (userRes.length === 0) {
      user = await findUserByEmail(email);

      if (user && user.hasEmailVerified) return "alreadyVerified";
    }

    const userId = userRes[0]?.userId || user?.userId;

    if (!userId) throw new Error("No user id");

    const ott = genOTT();

    await db
      .insert(ottsTable)
      .values({ userId, ott })
      .onConflictDoUpdate({ target: ottsTable.userId, set: { ott } });

    // TODO: send out email with ott
    console.log("New user registered:", email, ",", ott);

    return user ? "updated" : "created";
  }

  async verifyOTT(signInParams: { email: string; ott: string }) {
    const emailHash = await getHashBase64(signInParams.email, config.serverKeys.hashingKey);

    const res = await db.query.ottsTable.findFirst({
      columns: {},
      where: (ottRow, { eq, and, gte }) =>
        and(eq(ottRow.ott, signInParams.ott), gte(ottRow.expiresAt, new Date())),
      with: {
        user: {
          columns: {
            userId: true,
            hasEmailVerified: true,
            emailHash: true,
          },
        },
      },
    });

    if (!res || !res.user) throw new Error("Token is not valid or expired");

    const { user } = res;

    if (user.emailHash !== emailHash) throw new Error("Email is incorrect");

    if (!user.hasEmailVerified)
      await db
        .update(usersTable)
        .set({ hasEmailVerified: true })
        .where(eq(usersTable.userId, user.userId));

    await db.delete(ottsTable).where(eq(ottsTable.userId, user.userId));

    return user.userId;
  }

  async genSrpServerEphemeral(email: string) {
    const emailHash = await getHashBase64(email, config.serverKeys.hashingKey);

    let user = (await db.query.usersTable.findFirst({
      columns: {
        userId: true,
      },
      where: (dbUser, { eq }) => eq(dbUser.emailHash, emailHash),
      with: {
        srp: true,
      },
    })) as { userId: string; srp: { srpSalt: string; srpVerifier: string } }; // TODO: fix

    // if no user cannot be found in the database, a bogus salt and ephemeral value should be returned, to avoid leaking which users have signed up.
    if (!user) {
      const fakePassword = (Math.random() + 1).toString(36).substring(2);
      user = { userId: crypto.randomUUID(), srp: await genSrpAttributes(fakePassword) };
    }

    const { srpSalt, srpVerifier } = user.srp;
    const { userId } = user;

    const srpServerEphemeral = await srpServer.generateEphemeral(srpVerifier);

    return { srpSalt, srpVerifier, srpServerEphemeral, userId };
  }

  async verifySrpSession(
    srpServerEphemeralSecret: string,
    srpClientEphemeralPublic: string,
    srpSalt: string,
    srpVerifier: string,
    srpClientSessionProof: string,
  ) {
    const srpServerSession = await srpServer.deriveSession(
      srpServerEphemeralSecret,
      srpClientEphemeralPublic,
      srpSalt,
      "",
      srpVerifier,
      srpClientSessionProof,
    );

    return srpServerSession;
  }

  async finishSignUp(userId: string, finishSignUpParams: FinishSignUpParams) {
    const user = await findUserByUserId(userId);

    if (user === undefined) throw new UserNotFoundError();
    if (!user.hasEmailVerified) throw new UserEmailNotVerifiedError();

    await db.insert(srpsTable).values({
      userId,
      ...finishSignUpParams.srpParams,
    });

    await db.insert(keysTable).values({
      userId,
      ...finishSignUpParams.keyParams,
    });
  }
}

export const userAuthService = new Elysia({ name: "user-auth/service" })
  .use(authPlugin)
  .model({
    signUpUserParams,
    finishSignUpParams,
    signInParams,
    verifyOTTParams,
    signInVerifySrpParams,
    cookies,
  })
  .macro(({ onBeforeHandle }) => ({
    isSignedIn(enabled: boolean) {
      if (!enabled) return;

      onBeforeHandle(async ({ error, jwt, cookie: { auth } }) => {
        const value = await jwt.verify(auth?.value);
        if (!value) error(401, "Unauthorized");
      });
    },

    isOTTtmpSignedIn(enabled: boolean) {
      if (!enabled) return;

      onBeforeHandle(async ({ error, jwt, cookie: { tmpSignUpAuth } }) => {
        const value = await jwt.verify(tmpSignUpAuth?.value);

        if (!value) error(401, "Unauthorized");
      });
    },
  }));

export const withOTTtmpUserId = new Elysia()
  .use(userAuthService)
  .guard({ isSignedIn: false, isOTTtmpSignedIn: true })
  .resolve(async ({ jwt, cookie: { tmpSignUpAuth } }) => {
    const value = (await jwt.verify(tmpSignUpAuth?.value)) as {
      userId: string;
      ott: string;
      exp: number;
    };

    const { userId, ott } = value;
    return { userId, ott };
  })
  .as("plugin");

export const userAuthRoutes = new Elysia({ prefix: "/user-auth" })
  .state("srp", srpState)
  .use(userAuthService)
  .decorate("userAuthController", new UserAuthController())
  .put(
    "/sign-up",
    async ({ body: { email }, userAuthController }): Promise<AResponse> => {
      const res = await userAuthController.signUp({ email });

      if (res === "alreadyVerified") return { message: res };

      return { message: "signedUp" };
    },
    {
      body: "signUpUserParams",
    },
  )
  /**
   * Used to verify the email address initially
   */
  .post(
    "/verify-ott",
    async ({ userAuthController, body: { email, ott }, error, cookie: { tmpSignUpAuth }, jwt }) => {
      let userId: string;

      try {
        userId = await userAuthController.verifyOTT({ email, ott });
      } catch {
        return error(401, "Unauthorized");
      }

      const value = await jwt.sign({ userId, ott });

      tmpSignUpAuth.set({
        value,
        httpOnly: true,
        maxAge: 1800, // 30 min
        sameSite: false,
        secure: false, // TODO: enable
      });

      return { message: "verified" };
    },
    { body: "verifyOTTParams", cookie: "cookies" },
  )
  .post(
    "/sign-in",
    async ({
      body: { email, srpClientEphemeralPublic },
      userAuthController,
      store,
      jwt,
      cookie: { tmpSignInAuth, auth },
    }) => {
      // Check user already signed in
      if (auth?.value) {
        const value = await jwt.verify(auth.value);
        if (value) {
          return { message: "already signed in" };
        } else {
          auth.remove();
        }
      }

      const { srpSalt, srpServerEphemeral, srpVerifier, userId } =
        await userAuthController.genSrpServerEphemeral(email);

      const srpServerEphemeralPublic = srpServerEphemeral.public;
      const srpServerEphemeralSecret = srpServerEphemeral.secret;

      store.srp.push({
        userId,
        srpServerEphemeralSecret,
        srpSalt,
        srpVerifier,
      });

      const value = await jwt.sign({ userId, srpClientEphemeralPublic });

      tmpSignInAuth.set({
        value,
        httpOnly: true,
        maxAge: 1800, // 30 min
        sameSite: false,
        secure: false, // TODO: enable
      });

      return {
        srpSalt,
        srpServerEphemeralPublic,
      };
    },
    {
      body: "signInParams",
      cookie: "cookies",
    },
  )
  .post(
    "/sign-in/verify-srp",
    async ({
      body: { srpClientSessionProof },
      userAuthController,
      store,
      error,
      jwt,
      cookie: { auth, tmpSignInAuth },
    }) => {
      // Check user already signed in
      if (auth?.value) {
        const value = await jwt.verify(auth.value);
        if (value) {
          return { message: "already signed in" };
        }
      }

      const tmpSignInAuthValue = (await jwt.verify(tmpSignInAuth?.value)) as {
        userId: string;
        srpClientEphemeralPublic: string;
        exp: number;
      };

      const { userId, srpClientEphemeralPublic } = tmpSignInAuthValue;
      const srpUserState = store.srp.find((srp) => srp.userId === userId);

      if (!srpUserState) return error(401, { message: "unauthorized" });

      const { srpServerEphemeralSecret, srpSalt, srpVerifier } = srpUserState;
      let srpServerSession: Awaited<ReturnType<typeof userAuthController.verifySrpSession>>;

      try {
        srpServerSession = await userAuthController.verifySrpSession(
          srpServerEphemeralSecret,
          srpClientEphemeralPublic,
          srpSalt,
          srpVerifier,
          srpClientSessionProof,
        );
      } catch {
        // wrong password
        return error(401, { message: "unauthorized" });
      }

      const { proof: srpServerSessionProof, key: srpServerSessionKey } = srpServerSession;

      // Remove user srp session from tmp store
      store.srp = store.srp.filter((srp) => srp.userId !== userId);

      // create jwt token for further authorization
      const value = await jwt.sign({ userId, srpServerSessionKey });

      // Remove temporary cookie
      tmpSignInAuth?.remove();

      auth.set({
        value,
        httpOnly: true,
        maxAge: 7 * 86400,
        sameSite: false,
        secure: false, // TODO: enable
      });

      return {
        srpServerSessionProof,
      };
    },
    { body: "signInVerifySrpParams", cookie: "cookies" },
  )
  .use(withOTTtmpUserId)
  .put(
    "/finish-sign-up",
    async ({ body, userId, userAuthController, cookie: { tmpSignUpAuth }, error }) => {
      try {
        await userAuthController.finishSignUp(userId, body);
      } catch (e) {
        if (e instanceof UserNotFoundError) {
          return error(401, "Unauthorized");
        } else if (e instanceof UserEmailNotVerifiedError) {
          return error(401, "Not Verified");
        }

        throw e;
      } finally {
        tmpSignUpAuth.remove();
      }

      return { status: 200, message: "success" };
    },
    { body: "finishSignUpParams", cookie: "cookies" },
  );
