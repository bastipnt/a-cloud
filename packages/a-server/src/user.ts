import Elysia, { t } from "elysia";
import { db } from "./db";
import { usersTable } from "./db/schema/users";
import { keysTable } from "./db/schema/keys";
import { encryptBoxBase64, getHashBase64 } from "a-crypto";
import { serverKeys } from "../config";

export type CreateUserParams = {
  userParams: {
    email: string;
  };

  keyParams: {
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
};

const createUserParams = t.Object({
  userParams: t.Object({
    email: t.String(),
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

class UserController {
  async create(createUserParams: CreateUserParams) {
    const { email } = createUserParams.userParams;

    const [encryptedEmail, emailNonce] = await encryptBoxBase64(
      btoa(email),
      serverKeys.encryptionKey
    );

    const newUser = {
      encryptedEmail,
      emailNonce,
      emailHash: await getHashBase64(createUserParams.userParams.email, ""),
    };
    const userRes = await db
      .insert(usersTable)
      .values(newUser)
      .returning({ userId: usersTable.userId });

    const userId = userRes[0].userId;

    await db.insert(keysTable).values({
      userId,
      ...createUserParams.keyParams,
    });

    return userId;
  }
}

export const userRoutes = new Elysia({ prefix: "/user" })
  .decorate("userController", new UserController())
  .model({ createUserParams })
  .put(
    "/new",
    async ({ body, userController }) => {
      const userId = await userController.create(body);
      return { status: 200, message: "success", userId };
    },
    {
      body: "createUserParams",
    }
  );
