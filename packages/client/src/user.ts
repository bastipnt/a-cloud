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

export const signIn = async (email: string): Promise<ProofSrpAttributes> => {
  const { srpClientEphemeralPublic, srpClientEphemeralSecret } = genSrpClientEphemeral();

  const res = await api["user-auth"]["sign-in"].post({
    email,
    srpClientEphemeralPublic,
  });

  if (res.status !== 200 || !res.data) throw new Error("Something went wrong signing in");

  return { srpClientEphemeralSecret, srpClientEphemeralPublic, ...res.data };
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

  if (res.status !== 200 || !res.data) throw new Error("Verify srp failed");

  const { srpServerSessionProof } = res.data;

  await verifySrpSession(
    srpClientEphemeralPublic,
    srpClientSessionProof,
    srpClientSessionKey,
    srpServerSessionProof,
  );
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

  return res.status === 200;
};

export const getUser = async () => {
  const res = await api.user.index.get();

  if (res.status !== 200 || !res.data) throw new Error("Not logged in");

  return res.data.userId;
};
