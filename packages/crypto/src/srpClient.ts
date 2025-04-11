import { createSRPClient } from "@swan-io/srp";

const srpClient = createSRPClient("SHA-256", 2048);

export const genSrpAttributes = async (password: string) => {
  const srpSalt = srpClient.generateSalt();
  const srpPrivateKey = await srpClient.deriveSafePrivateKey(srpSalt, password);
  const srpVerifier = srpClient.deriveVerifier(srpPrivateKey);

  return { srpSalt, srpVerifier };
};

export const genSrpClientEphemeral = () => {
  const srpClientEphemeral = srpClient.generateEphemeral();

  return {
    srpClientEphemeralPublic: srpClientEphemeral.public,
    srpClientEphemeralSecret: srpClientEphemeral.secret,
  };
};

export const deriveSrpClientSession = async (
  password: string,
  srpSalt: string,
  srpClientEphemeralSecret: string,
  srpServerEphemeralPublic: string,
) => {
  const srpPrivateKey = await srpClient.deriveSafePrivateKey(srpSalt, password);

  const srpClientSession = await srpClient.deriveSession(
    srpClientEphemeralSecret,
    srpServerEphemeralPublic,
    srpSalt,
    "",
    srpPrivateKey,
  );

  return {
    srpClientSessionProof: srpClientSession.proof,
    srpClientSessionKey: srpClientSession.key,
  };
};

export const verifySrpSession = async (
  srpClientEphemeralPublic: string,
  srpClientSessionProof: string,
  srpClientSessionKey: string,
  srpServerSessionProof: string,
) => {
  await srpClient.verifySession(
    srpClientEphemeralPublic,
    { proof: srpClientSessionProof, key: srpClientSessionKey },
    srpServerSessionProof,
  );
};
