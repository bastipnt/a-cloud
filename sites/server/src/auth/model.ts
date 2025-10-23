import { t } from "elysia";

export type SrpUser = {
  userId: string;
  srpServerEphemeralSecret: string;
  srpSalt: string;
  srpVerifier: string;
};

export const srpState: { signInUsers: SrpUser[] } = { signInUsers: [] };

export const signUpUserParams = t.Object({
  email: t.String({ format: "email" }),
});

export const verifyOTTParams = t.Object({
  email: t.String({ format: "email" }),
  ott: t.String(),
});

export const signInParams = t.Object({
  email: t.String({ format: "email" }),
  srpClientEphemeralPublic: t.String(),
});

export const signInVerifySrpParams = t.Object({
  srpClientSessionProof: t.String(),
});

export const finishSignUpParams = t.Object({
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

export const keyResponseParams = t.Object({
  encryptedMainKey: t.String(),
  keyEncryptionKeySalt: t.String(),
  mainKeyNonce: t.String(),
  memLimit: t.Number(),
  opsLimit: t.Number(),
});

export type KeyParams = typeof keyResponseParams.static;

export const signInResponseParams = t.Object({
  keyParams: keyResponseParams,
  srpServerSessionProof: t.String(),
});

export const signInAlreadySignedInResponseParams = t.Object({
  message: t.Literal("already signed in"),
});

export const signInErrorResponseParams = t.Object({
  message: t.Literal("Unauthorized"),
});

export const cookies = t.Cookie({
  auth: t.Optional(t.String()),
  tmpSignInAuth: t.Optional(t.String()),
  tmpSignUpAuth: t.Optional(t.String()),
});

export const authCookie = t.Cookie({
  auth: t.String(),
});

export const tmpSignInAuthCookie = t.Cookie({
  tmpSignInAuth: t.String(),
});

export const tmpSignUpAuthCookie = t.Cookie({
  tmpSignUpAuth: t.String(),
});

export type FinishSignUpParams = typeof finishSignUpParams.static;

export class UserNotFoundError extends Error {
  override name = "UserNotFoundError";
}

export class UserEmailNotVerifiedError extends Error {
  override name = "UserEmailNotVerifiedError";
}

export class UserAlreadyVerifiedError extends Error {
  override name = "UserAlreadyVerifiedError";
}

export class MissingKeyParamsError extends Error {
  override name = "MissingKeyParamsError";
}
