import {
  createCryptoWorker,
  deriveSrpClientSession,
  genSrpAttributes,
  genSrpClientEphemeral,
  verifySrpSession,
} from "@acloud/crypto";
import { api } from "../api";

type ProofSrpAttributes = {
  srpClientEphemeralSecret: string;
  srpSalt: string;
  srpServerEphemeralPublic: string;
  srpClientEphemeralPublic: string;
};

export class SignInError extends Error {
  override name: string = "Sign in error";
}

export class NotLoggedInError extends Error {
  override name: string = "Not logged in";
}

export class NotVerifiedError extends Error {
  override name: string = "Not verified";
}

export class UserAlreadyVerifiedError extends Error {
  override name: string = "UserAlreadyVerifiedError";
}

export const signIn = async (
  email: string,
): Promise<{
  proofSrpAttributes?: ProofSrpAttributes;
  alreadySignedIn: boolean;
}> => {
  const { srpClientEphemeralPublic, srpClientEphemeralSecret } = genSrpClientEphemeral();

  const res = await api["user-auth"]["sign-in"].post({
    email,
    srpClientEphemeralPublic,
  });

  if (res.status !== 200 || !res.data) throw new SignInError();

  if (res.data.srpSalt === undefined && res.data.srpServerEphemeralPublic === undefined) {
    if (res.data.message === "already signed in") return { alreadySignedIn: true };
    throw new Error("Something went wrong");
  }

  return {
    proofSrpAttributes: { srpClientEphemeralSecret, srpClientEphemeralPublic, ...res.data },
    alreadySignedIn: false,
  };
};

export const proofSignIn = async (password: string, proofSrpAttributes: ProofSrpAttributes) => {
  const { srpSalt, srpClientEphemeralSecret, srpServerEphemeralPublic, srpClientEphemeralPublic } =
    proofSrpAttributes;

  const { srpClientSessionProof, srpClientSessionKey } = await deriveSrpClientSession(
    password,
    srpSalt,
    srpClientEphemeralSecret,
    srpServerEphemeralPublic,
  );

  const res = await api["user-auth"]["sign-in"]["verify-srp"].post({
    srpClientSessionProof,
  });

  if (res.status !== 200 || !res.data) throw new SignInError();
  if (!("srpServerSessionProof" in res.data)) throw new SignInError();

  const { srpServerSessionProof } = res.data;

  await verifySrpSession(
    srpClientEphemeralPublic,
    srpClientSessionProof,
    srpClientSessionKey,
    srpServerSessionProof,
  );

  return res.data.keyParams!;
};

/**
 *
 * @param email the users email
 * @param password the users password
 * @returns the userId of the new created user and the generated keyParams
 */
export const signUp = async (email: string) => {
  const res = await api["user-auth"]["sign-up"].put({ email });

  if (res.status !== 200) throw new Error("User could not be created");
};

export const verifyOTT = async (email: string, ott: string) => {
  const res = await api["user-auth"]["verify-ott"].post({
    email,
    ott,
  });

  return res.status === 200;
};

export const finishSignUp = async (password: string) => {
  const cryptoWorker = await createCryptoWorker().remote;

  const srpParams = await genSrpAttributes(password);
  const keyParams = await cryptoWorker.genNewUserKeys(password);

  const res = await api["user-auth"]["finish-sign-up"].put({
    srpParams,
    keyParams,
  });

  if (res.status === 401 && res.error?.value === "Not Verified") {
    throw new NotVerifiedError();
  }

  if (res.status === 400 && res.error?.value === "UserAlreadyVerifiedError") {
    throw new UserAlreadyVerifiedError();
  }

  return res.status === 200;
};

export const getUser = async () => {
  const res = await api.user.get();

  if (res.status !== 200 || !res.data) throw new NotLoggedInError();

  return res.data.userId;
};
