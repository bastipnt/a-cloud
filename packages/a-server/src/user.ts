import Elysia, { t } from "elysia";
import { db } from "./db";
import { usersTable } from "./db/schema/users";
import { keysTable } from "./db/schema/keys";
import { encryptBoxBase64, genOTT, getHashBase64 } from "a-crypto";
import { serverKeys } from "../config";
import { authPlugin } from "./plugins/authPlugin";
import { ottsTable } from "./db/schema/otts";
import { srpsTable } from "./db/schema/srps";
import { srpServer } from "./srpServer";

const srpState: {
  userId: string;
  srpServerEphemeralSecret: string;
  srpSalt: string;
  srpVerifier: string;
}[] = [];

type FinishSignUpParams = {
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

const signUpUserParams = t.Object({
  email: t.String({ format: "email" }),
  srpSalt: t.String(),
  srpVerifier: t.String(),
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
});

class UserController {
  async signUp(signUpParams: { email: string }) {
    const { email } = signUpParams;

    const [encryptedEmail, emailNonce] = await encryptBoxBase64(
      btoa(email),
      serverKeys.encryptionKey
    );

    const emailHash = await getHashBase64(email, serverKeys.hashingKey);

    const newUser = {
      encryptedEmail,
      emailNonce,
      emailHash,
    };

    const userRes = await db
      .insert(usersTable)
      .values(newUser)
      .returning({ userId: usersTable.userId });

    const userId = userRes[0].userId;
    const ott = genOTT();

    await db.insert(ottsTable).values({ userId, ott });

    // TODO: send out email with ott
    console.log("New user registered:", email, ",", ott);

    return { userId, ott };
  }

  async verifyOTT(signInParams: { email: string; ott: string }) {
    const emailHash = await getHashBase64(
      signInParams.email,
      serverKeys.hashingKey
    );

    const res = await db.query.ottsTable.findFirst({
      columns: {},
      where: (ottRow, { eq, and, lte }) =>
        and(
          eq(ottRow.ott, signInParams.ott),
          lte(ottRow.expiresAt, new Date())
        ),
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
      await db.update(usersTable).set({ hasEmailVerified: true });

    return user.userId;
  }

  async saveSrpVerifier(userId: string, srpSalt: string, srpVerifier: string) {
    await db.insert(srpsTable).values({ userId, srpSalt, srpVerifier });
  }

  async genSrpServerEphemeral(email: string) {
    const emailHash = await getHashBase64(email, serverKeys.hashingKey);

    const user = (await db.query.usersTable.findFirst({
      columns: {
        userId: true,
      },
      where: (dbUser, { eq }) => eq(dbUser.emailHash, emailHash),
      with: {
        srp: true,
      },
    })) as { userId: string; srp: { srpSalt: string; srpVerifier: string } }; // TODO: fix

    // TODO: if no user cannot be found in the database, a bogus salt and ephemeral value should be returned, to avoid leaking which users have signed up.
    if (!user) throw new Error("User not found");
    if (!user.srp) throw new Error(`Srp not found for user: ${user.userId}`);

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
    srpClientSessionProof: string
  ) {
    const srpServerSession = await srpServer.deriveSession(
      srpServerEphemeralSecret,
      srpClientEphemeralPublic,
      srpSalt,
      "",
      srpVerifier,
      srpClientSessionProof
    );

    return srpServerSession;
  }

  async finishSignUp(userId: string, finishSignUpParams: FinishSignUpParams) {
    await db.insert(keysTable).values({
      userId,
      ...finishSignUpParams,
    });

    return userId;
  }
}

export const userService = new Elysia({ name: "user/service" })
  .use(authPlugin)
  .macro(({ onBeforeHandle }) => ({
    isSignedIn(enabled: boolean) {
      if (!enabled) return;

      onBeforeHandle(async ({ error, jwt, cookie: { auth } }) => {
        const userId = await jwt.verify(auth.value);
        if (!userId)
          return error(401, { success: false, message: "Unauthorized" });
      });
    },
  }));

export const withUserId = new Elysia({ name: "user/withUserId" })
  .use(userService)
  .guard({ isSignedIn: true })
  .resolve(async ({ jwt, cookie: { auth } }) => {
    const value = (await jwt.verify(auth.value)) as {
      userId: string;
      exp: number;
    };
    const userId = value.userId;
    return { userId };
  })
  .as("plugin");

export const userRoutes = new Elysia({ prefix: "/user" })
  .state("srp", srpState)
  .use(userService)
  .decorate("userController", new UserController())
  .model({
    signUpUserParams,
    finishSignUpParams,
    signInParams,
    verifyOTTParams,
    signInVerifySrpParams,
  })
  .put(
    "/sign-up",
    async ({ body: { email, srpSalt, srpVerifier }, userController }) => {
      const { userId } = await userController.signUp({ email });

      await userController.saveSrpVerifier(userId, srpSalt, srpVerifier);

      return { status: 200, message: "success", userId };
    },
    {
      body: "signUpUserParams",
    }
  )
  /**
   * Used to verify the email address initially
   */
  .post(
    "/verify-ott",
    async ({ userController, body, error }) => {
      let userId: string;

      try {
        userId = await userController.verifyOTT(body);
      } catch (e) {
        return error(401, { success: false, message: "User does not exist" });
      }

      return { message: "ott verified" };
    },
    { body: "verifyOTTParams" }
  )
  .post(
    "/sign-in",
    async ({
      body: { email, srpClientEphemeralPublic },
      userController,
      store,
      jwt,
      cookie: { tmpAuth },
    }) => {
      // TODO: user already signed in

      const { srpSalt, srpServerEphemeral, srpVerifier, userId } =
        await userController.genSrpServerEphemeral(email);

      const srpServerEphemeralPublic = srpServerEphemeral.public;
      const srpServerEphemeralSecret = srpServerEphemeral.secret;

      store.srp.push({
        userId,
        srpServerEphemeralSecret,
        srpSalt,
        srpVerifier,
      });

      const value = await jwt.sign({ userId, srpClientEphemeralPublic });

      tmpAuth.set({
        value,
        httpOnly: true,
        maxAge: 1800, // 30 min
        path: "/",
      });

      return {
        message: "srp",
        srpSalt,
        srpServerEphemeralPublic,
      };
    },
    {
      body: "signInParams",
    }
  )
  .post(
    "sign-in/verify-srp",
    async ({
      body: { srpClientSessionProof },
      userController,
      store,
      error,
      jwt,
      cookie: { auth, tmpAuth },
    }) => {
      const tmpAuthValue = (await jwt.verify(tmpAuth.value)) as {
        userId: string;
        srpClientEphemeralPublic: string;
        exp: number;
      };

      const { userId, srpClientEphemeralPublic } = tmpAuthValue;
      const srpUserState = store.srp.find((srp) => srp.userId === userId);

      if (!srpUserState) return error(400, { message: "something went wrong" }); // TODO: better error

      const { srpServerEphemeralSecret, srpSalt, srpVerifier } = srpUserState;

      const srpServerSession = await userController.verifySrpSession(
        srpServerEphemeralSecret,
        srpClientEphemeralPublic,
        srpSalt,
        srpVerifier,
        srpClientSessionProof
      );

      const { proof: srpServerSessionProof, key: srpServerSessionKey } =
        srpServerSession;

      // Remove user srp session from tmp store
      store.srp = store.srp.filter((srp) => srp.userId !== userId);

      // create jwt token for further authorization
      const value = await jwt.sign({ userId, srpServerSessionKey });

      // Remove temporary cookie
      tmpAuth.remove();

      auth.set({
        value,
        httpOnly: true,
        maxAge: 7 * 86400,
        path: "/",
      });

      return {
        message: "success",
        srpServerSessionProof,
      };
    },
    { body: "signInVerifySrpParams" }
  )
  .use(withUserId)
  .put(
    "/finish-sign-up",
    async ({ body, userId, userController }) => {
      await userController.finishSignUp(userId, body);

      return { status: 200, message: "success" };
    },
    { body: "finishSignUpParams" }
  )
  .get("/", async ({ userId }) => {
    return { message: "Get user", userId };
  });
