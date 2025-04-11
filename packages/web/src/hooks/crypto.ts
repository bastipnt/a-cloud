import { decryptFile, encryptFile, genNewUserKeys } from "@acloud/crypto";

export const useCrypto = () => {
  return { encryptFile, decryptFile, genNewUserKeys };
};
