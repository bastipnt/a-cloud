import {
  deriveSrpClientSession,
  encryptBoxBase64,
  genNewUserKeys,
  genSrpAttributes,
  genSrpClientEphemeral,
  getHashBase64,
} from "@acloud/crypto";
import { serverKeys } from "@acloud/server/config";
import { srpServer } from "@acloud/server/src/srpServer";
import { genJWT } from "@acloud/server/util";

export const genUserId = () => {
  return crypto.randomUUID();
};

export const genPassword = () => {
  return crypto.getRandomValues(new BigUint64Array(1))[0]!.toString(36);
};

export const getEmailParams = async (email: string) => {
  const [encryptedEmail, emailNonce] = await encryptBoxBase64(
    btoa(email),
    serverKeys.encryptionKey,
  );

  const emailHash = await getHashBase64(email, serverKeys.hashingKey);

  return {
    encryptedEmail,
    emailNonce,
    emailHash,
  };
};

export const genSignUpParams = async (password: string) => {
  const srpParams = await genSrpAttributes(password);
  const keyParams = await genNewUserKeys(password);

  return { srpParams, keyParams };
};

export const genSprServerEphemeral = async (srpVerifier: string) => {
  return await srpServer.generateEphemeral(srpVerifier);
};

export const genSrpServerSession = async (
  srpServerEphemeralSecret: string,
  srpClientEphemeralPublic: string,
  srpSalt: string,
  srpVerifier: string,
  srpClientSessionProof: string,
) => {
  return await srpServer.deriveSession(
    srpServerEphemeralSecret,
    srpClientEphemeralPublic,
    srpSalt,
    "",
    srpVerifier,
    srpClientSessionProof,
  );
};

export const genUser = async (name: string) => {
  const userId = genUserId();
  const password = genPassword();
  const email = `${name}@example.com`;

  const emailParams = await getEmailParams(email);

  const signUpParams = await genSignUpParams(password);

  const srpServerEphemeral = await genSprServerEphemeral(signUpParams.srpParams.srpVerifier);
  const srpClientEphemeral = genSrpClientEphemeral();

  const srpClientSession = await deriveSrpClientSession(
    password,
    signUpParams.srpParams.srpSalt,
    srpClientEphemeral.srpClientEphemeralSecret,
    srpServerEphemeral.public,
  );

  const srpServerSession = await genSrpServerSession(
    srpServerEphemeral.secret,
    srpClientEphemeral.srpClientEphemeralPublic,
    signUpParams.srpParams.srpSalt,
    signUpParams.srpParams.srpVerifier,
    srpClientSession.srpClientSessionProof,
  );

  const jwt = await genJWT({
    userId: userId,
    srpServerSessionKey: srpServerSession.key,
  });

  return {
    userId,
    name,
    email,
    emailParams,
    password,
    signUpParams,
    srpServerEphemeral,
    srpServerSession,
    srpClientEphemeral,
    srpClientSession,
    jwt,
  };
};

export { genJWT };
