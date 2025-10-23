import { config } from "@acloud/config";
import {
  encryptBoxBase64,
  genOTT,
  genPassword,
  genSrpAttributes,
  getHashBase64,
} from "@acloud/crypto";
import {
  checkUserExistsByUserId,
  db,
  eq,
  findUserByEmail,
  findUserByUserId,
  getKeyParamsByUserId,
  keysTable,
  ottsTable,
  srpsTable,
  usersTable,
  type UserType,
} from "@acloud/db";
import { srpService } from "../services/srp-service";
import {
  FinishSignUpParams,
  MissingKeyParamsError,
  UserAlreadyVerifiedError,
  UserEmailNotVerifiedError,
  UserNotFoundError,
} from "./model";

export abstract class UserAuthService {
  static async signUp(signUpParams: {
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

  static async verifyOTT(signInParams: { email: string; ott: string }) {
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

  static async genSrpServerEphemeral(email: string) {
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
      const fakePassword = genPassword();
      user = { userId: crypto.randomUUID(), srp: await genSrpAttributes(fakePassword) };
    }

    const { srpSalt, srpVerifier } = user.srp;
    const { userId } = user;

    const srpServerEphemeral = await srpService.generateEphemeral(srpVerifier);

    return { srpSalt, srpVerifier, srpServerEphemeral, userId };
  }

  static async verifySrpSession(
    srpServerEphemeralSecret: string,
    srpClientEphemeralPublic: string,
    srpSalt: string,
    srpVerifier: string,
    srpClientSessionProof: string,
  ) {
    const srpServerSession = await srpService.deriveSession(
      srpServerEphemeralSecret,
      srpClientEphemeralPublic,
      srpSalt,
      "",
      srpVerifier,
      srpClientSessionProof,
    );

    return srpServerSession;
  }

  static async finishSignUp(userId: string, finishSignUpParams: FinishSignUpParams) {
    const user = await findUserByUserId(userId);

    console.log({ user });

    if (user === undefined) throw new UserNotFoundError();
    if (!user.hasEmailVerified) throw new UserEmailNotVerifiedError();
    if (
      (
        await db.query.srpsTable.findFirst({
          where: (s, { eq }) => eq(s.userId, userId),
          columns: { userId: true },
        })
      )?.userId
    ) {
      throw new UserAlreadyVerifiedError();
    }

    await db.insert(srpsTable).values({
      userId,
      ...finishSignUpParams.srpParams,
    });

    await db.insert(keysTable).values({
      userId,
      ...finishSignUpParams.keyParams,
    });
  }

  static async getKeyParams(userId: string) {
    const keyParams = await getKeyParamsByUserId(userId);

    if (!keyParams) throw new MissingKeyParamsError();

    return keyParams;
  }

  static async checkUserExistsByUserId(userId: string) {
    return await checkUserExistsByUserId(userId);
  }
}
